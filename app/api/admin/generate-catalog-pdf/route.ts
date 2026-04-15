import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const debugMode = url.searchParams.get("debug") === "1"

  let stepReached = "init"
  let ringsCount = 0
  let errorMsg = ""
  let errorStack = ""

  try {
    console.error("[PDF] Route entered, debugMode=", debugMode)
    stepReached = "db_fetch_started"

    // Fetch rings from database
    const supabase = await createClient()
    console.error("[PDF] Supabase client created")

    const { data: rings, error: dbError } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (dbError) {
      console.error("[PDF] DB Error:", dbError)
      errorMsg = `DB Error: ${dbError.message}`
      stepReached = "db_fetch_failed"

      if (debugMode) {
        return NextResponse.json({ ok: false, stepReached, errorMsg, ringsCount: 0 })
      }
      return new Response("Database error", { status: 500 })
    }

    ringsCount = rings?.length || 0
    console.error("[PDF] DB success, rings count:", ringsCount)
    stepReached = "db_fetch_done"

    // Return debug info if requested
    if (debugMode) {
      console.error("[PDF] Debug mode - returning JSON at step:", stepReached)
      return NextResponse.json({
        ok: true,
        stepReached,
        ringsCount,
        rings: rings?.slice(0, 3).map((r) => ({ code: r.code, price: r.price })) || [],
      })
    }

    // PHASE 1: Minimal PDF
    console.error("[PDF] Creating PDFDocument")
    stepReached = "pdf_doc_creating"

    const doc = new PDFDocument({ size: "A4", margin: 40 })
    const chunks: Buffer[] = []

    console.error("[PDF] Attaching data handler")
    stepReached = "pdf_data_handler_attached"

    doc.on("data", (chunk) => {
      console.error("[PDF] Received data chunk, size:", chunk.length)
      chunks.push(chunk)
    })

    console.error("[PDF] Setting up error handler")
    doc.on("error", (err) => {
      console.error("[PDF] PDFDocument error event:", err)
      stepReached = "pdf_error_event"
      errorMsg = err instanceof Error ? err.message : String(err)
      errorStack = err instanceof Error ? err.stack : ""
    })

    // CRITICAL: Set up the Promise BEFORE adding content or calling end()
    console.error("[PDF] Creating Promise and attaching end handler")
    stepReached = "pdf_promise_setup"

    const pdfPromise = new Promise<NextResponse>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error("[PDF] TIMEOUT waiting for PDF end event")
        stepReached = "pdf_timeout"
        reject(new Error("PDF generation timeout"))
      }, 5000)

      doc.on("end", () => {
        clearTimeout(timeoutId)
        console.error("[PDF] PDF end event received")
        stepReached = "pdf_end_event"

        if (chunks.length === 0) {
          console.error("[PDF] ERROR: No chunks collected!")
          stepReached = "pdf_no_chunks"
          reject(new Error("No PDF data collected"))
          return
        }

        console.error("[PDF] Concatenating", chunks.length, "chunks")
        const pdfBuffer = Buffer.concat(chunks)
        console.error("[PDF] PDF buffer created, size:", pdfBuffer.length)
        stepReached = "pdf_buffer_created"

        console.error("[PDF] Creating NextResponse")
        const response = new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
            "Content-Length": pdfBuffer.length.toString(),
          },
        })
        console.error("[PDF] NextResponse created successfully")
        stepReached = "pdf_response_created"

        resolve(response)
      })
    })

    console.error("[PDF] Adding minimal content")
    stepReached = "pdf_content_adding"

    doc.fontSize(24).font("Helvetica-Bold").text("Catálogo de Anillos Guillén", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).font("Helvetica").text(`Total de anillos: ${ringsCount}`, { align: "center" })

    console.error("[PDF] Content added, calling doc.end()")
    stepReached = "pdf_end_called"
    doc.end()

    console.error("[PDF] Waiting for PDF Promise to resolve...")
    stepReached = "pdf_waiting_for_promise"

    return pdfPromise
  } catch (error) {
    console.error("[PDF] CATCH - Top-level error:", error)
    if (error instanceof Error) {
      console.error("[PDF] Error message:", error.message)
      console.error("[PDF] Error stack:", error.stack)
      errorMsg = error.message
      errorStack = error.stack
    } else {
      errorMsg = String(error)
    }

    console.error("[PDF] Final state - stepReached:", stepReached)

    if (debugMode) {
      return NextResponse.json(
        {
          ok: false,
          stepReached,
          ringsCount,
          errorMsg,
          errorStack,
        },
        { status: 500 },
      )
    }

    return new Response("PDF generation failed", { status: 500 })
  }
}
