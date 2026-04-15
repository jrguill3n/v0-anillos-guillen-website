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

  try {
    console.error("[PDF Route] Route entered, debugMode=", debugMode)
    stepReached = "db_fetch_started"

    // Fetch rings from database
    const supabase = await createClient()
    console.error("[PDF Route] Supabase client created")

    const { data: rings, error: dbError } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (dbError) {
      console.error("[PDF Route] DB Error:", dbError.message, dbError)
      errorMsg = `DB Error: ${dbError.message}`
      stepReached = "db_fetch_failed"

      if (debugMode) {
        return NextResponse.json({
          ok: false,
          stepReached,
          errorMsg,
          ringsCount: 0,
        })
      }
      return new Response("Database error", { status: 500 })
    }

    ringsCount = rings?.length || 0
    console.error("[PDF Route] DB fetch success, rings count:", ringsCount)
    stepReached = "db_fetch_done"

    // Debug mode: return JSON instead of PDF
    if (debugMode) {
      console.error("[PDF Route] Debug mode - returning JSON")
      return NextResponse.json({
        ok: true,
        stepReached,
        ringsCount,
        rings: rings?.map((r) => ({ code: r.code, price: r.price })) || [],
      })
    }

    // Create PDF document
    console.error("[PDF Route] Creating PDFDocument")
    stepReached = "pdf_doc_created"

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk) => {
      chunks.push(chunk)
    })

    return new Promise<NextResponse>((resolve, reject) => {
      doc.on("end", () => {
        console.error("[PDF Route] PDF document ended, chunks:", chunks.length)
        stepReached = "pdf_finalized"
        const pdfBuffer = Buffer.concat(chunks)
        console.error("[PDF Route] PDF buffer created, size:", pdfBuffer.length)

        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
              "Content-Length": pdfBuffer.length.toString(),
            },
          }),
        )
      })

      doc.on("error", (err) => {
        console.error("[PDF Route] PDFDocument error:", err, err instanceof Error ? err.stack : "")
        stepReached = "pdf_error"
        reject(err)
      })

      try {
        // PHASE 1: Minimal PDF content
        console.error("[PDF Route] Adding title page")
        doc.fontSize(28).font("Helvetica-Bold").text("Catálogo de Anillos Guillén", { align: "center" })
        doc.moveDown()
        doc.fontSize(14)
          .font("Helvetica")
          .text("Anillos de Compromiso en Oro 14K con Diamante Natural", { align: "center" })
        doc.moveDown(2)
        doc.fontSize(12).font("Helvetica").text(`Total de anillos: ${ringsCount}`, { align: "center" })

        console.error("[PDF Route] Minimal content added, ending document")
        stepReached = "pdf_content_added"
        doc.end()
      } catch (contentErr) {
        console.error(
          "[PDF Route] Error adding content:",
          contentErr,
          contentErr instanceof Error ? contentErr.stack : "",
        )
        stepReached = "pdf_content_error"
        reject(contentErr)
      }
    })
  } catch (error) {
    console.error("[PDF Route] Top-level error:", error, error instanceof Error ? error.stack : "")
    console.error("[PDF Route] Final state - stepReached:", stepReached, "ringsCount:", ringsCount, "errorMsg:", errorMsg)

    if (debugMode) {
      return NextResponse.json(
        {
          ok: false,
          stepReached,
          ringsCount,
          errorMsg: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 },
      )
    }

    return new Response("PDF generation failed", { status: 500 })
  }
}
