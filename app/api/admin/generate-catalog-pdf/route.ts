import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { jsPDF } from "jspdf"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const debugMode = url.searchParams.get("debug") === "1"

  let stepReached = "init"
  let ringsCount = 0
  let errorMsg = ""

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

    // PHASE 1: Minimal PDF using jsPDF
    console.error("[PDF] Creating jsPDF document")
    stepReached = "pdf_creating"

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    console.error("[PDF] jsPDF document created")
    stepReached = "pdf_created"

    // Add minimal content
    console.error("[PDF] Adding content")
    stepReached = "pdf_content_adding"

    doc.setFontSize(24)
    doc.text("Catálogo de Anillos Guillén", 105, 40, { align: "center" })

    doc.setFontSize(12)
    doc.text(`Total de anillos: ${ringsCount}`, 105, 60, { align: "center" })

    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString("es-MX")}`, 105, 80, { align: "center" })

    console.error("[PDF] Content added")
    stepReached = "pdf_content_added"

    // Generate PDF buffer
    console.error("[PDF] Generating buffer")
    stepReached = "pdf_generating_buffer"

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    console.error("[PDF] Buffer created, size:", pdfBuffer.length)
    stepReached = "pdf_buffer_created"

    // Return PDF response
    console.error("[PDF] Creating response")
    stepReached = "pdf_creating_response"

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[PDF] CATCH - Top-level error:", error)
    if (error instanceof Error) {
      console.error("[PDF] Error message:", error.message)
      console.error("[PDF] Error stack:", error.stack)
      errorMsg = error.message
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
        },
        { status: 500 },
      )
    }

    return new Response("PDF generation failed", { status: 500 })
  }
}
