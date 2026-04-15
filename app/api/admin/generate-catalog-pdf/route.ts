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

    // PHASE 2: Full catalog PDF with cover page and ring grid
    console.error("[PDF] Creating jsPDF document")
    stepReached = "pdf_creating"

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    console.error("[PDF] jsPDF document created")
    stepReached = "pdf_created"

    // PAGE 1: COVER PAGE
    console.error("[PDF] Adding cover page")
    stepReached = "pdf_cover_page"

    doc.setFontSize(40)
    doc.setFont(undefined, "bold")
    doc.text("Anillos Guillén", 105, 50, { align: "center" })

    doc.setFontSize(16)
    doc.setFont(undefined, "normal")
    doc.text("Catálogo de Anillos de Compromiso", 105, 70, { align: "center" })

    doc.setFontSize(12)
    doc.text("Oro de 14K con Diamante Natural Certificado", 105, 85, { align: "center" })

    doc.setFontSize(11)
    doc.text("Atención personalizada por WhatsApp", 105, 110, { align: "center" })
    doc.text("+52 74 44 49 67 69", 105, 120, { align: "center" })

    // PAGE 2: CATALOG
    console.error("[PDF] Adding catalog page")
    stepReached = "pdf_catalog_page"

    doc.addPage()

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    const cardsPerRow = 2
    const cardWidth = (contentWidth - 5) / cardsPerRow // 5mm gap between cards
    const cardHeight = 50

    let rowIndex = 0
    let colIndex = 0
    let currentY = margin

    console.error("[PDF] Processing", ringsCount, "rings")
    stepReached = "pdf_processing_rings"

    if (rings && rings.length > 0) {
      for (const ring of rings) {
        // Check if we need a new page
        if (currentY + cardHeight + 10 > pageHeight - margin) {
          console.error("[PDF] Adding new page, currentY:", currentY)
          doc.addPage()
          currentY = margin
          colIndex = 0
          rowIndex = 0
        }

        // Calculate position
        const cardX = margin + colIndex * (cardWidth + 5)
        const cardY = currentY

        // Draw card border
        doc.setDrawColor(200, 200, 200)
        doc.rect(cardX, cardY, cardWidth, cardHeight)

        // Ring code
        doc.setFontSize(11)
        doc.setFont(undefined, "bold")
        doc.text(ring.code, cardX + 2, cardY + 8)

        // Price
        if (ring.price) {
          doc.setFontSize(10)
          doc.setFont(undefined, "bold")
          doc.text(`$${ring.price.toLocaleString("es-MX")} MXN`, cardX + 2, cardY + 16)
        }

        // Diamond info
        const mainDiamonds = ring.main_diamond_points || ring.diamond_points || 0
        const sideDiamonds = ring.side_diamond_points || 0
        const totalDiamonds = mainDiamonds + sideDiamonds
        const diamondText = totalDiamonds > 0 ? `${totalDiamonds} puntos` : "Diamante natural"

        doc.setFontSize(9)
        doc.setFont(undefined, "normal")
        doc.text(`Diamante: ${diamondText}`, cardX + 2, cardY + 24)

        // Gold info
        const goldColor = ring.metal_color || "Amarillo"
        const goldCapitalized = goldColor.charAt(0).toUpperCase() + goldColor.slice(1).toLowerCase()
        doc.text(`Oro: ${goldCapitalized} 14K`, cardX + 2, cardY + 32)

        // Move to next column
        colIndex++
        if (colIndex >= cardsPerRow) {
          colIndex = 0
          currentY += cardHeight + 8
        }
      }
    }

    // FOOTER PAGE
    console.error("[PDF] Adding footer page")
    stepReached = "pdf_footer_page"

    doc.addPage()
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Anillos Guillén", 105, 50, { align: "center" })

    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text("Acapulco, Guerrero", 105, 65, { align: "center" })
    doc.text("WhatsApp: +52 74 44 49 67 69", 105, 75, { align: "center" })

    doc.setFontSize(8)
    doc.text(`Catálogo generado: ${new Date().toLocaleString("es-MX")}`, 105, 280, { align: "center" })

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
