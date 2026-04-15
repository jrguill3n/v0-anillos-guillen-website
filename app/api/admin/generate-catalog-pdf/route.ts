import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit"
import fetch from "node-fetch"

export const runtime = "nodejs"

// Format diamond total (main + side = total points)
function formatDiamondTotal(mainPoints: number | null | undefined, sidePoints: number | null | undefined): string {
  const main = mainPoints && !isNaN(Number(mainPoints)) ? Number(mainPoints) : 0
  const side = sidePoints && !isNaN(Number(sidePoints)) && Number(sidePoints) > 0 ? Number(sidePoints) : 0
  const total = main + side
  if (total === 0) return "Diamante natural"
  return `${total} puntos`
}

// Format gold color
function formatGoldColor(color: string | null | undefined): string {
  if (!color) return "Amarillo 14K"
  const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
  return `${capitalizedColor} 14K`
}

// Fetch image as buffer
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return Buffer.from(await response.arrayBuffer())
  } catch (err) {
    console.error(`[PDF Route] Failed to fetch image: ${err}`)
    return null
  }
}

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

    // Pre-fetch all images
    console.error("[PDF Route] Starting image fetch")
    stepReached = "image_fetch_started"
    const ringDataWithImages: Array<{
      ring: (typeof rings)[0]
      imageBuffer: Buffer | null
    }> = []

    if (rings && rings.length > 0) {
      for (const ring of rings) {
        let imageBuffer: Buffer | null = null
        if (ring.image_url) {
          imageBuffer = await fetchImageBuffer(ring.image_url)
        }
        ringDataWithImages.push({ ring, imageBuffer })
      }
    }
    console.error("[PDF Route] Image fetch complete")
    stepReached = "image_fetch_done"

    // Create PDF document
    console.error("[PDF Route] Creating PDFDocument")
    stepReached = "pdf_doc_created"

    const doc = new PDFDocument({
      size: "A4",
      margin: 30,
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
        // PHASE 2: Full catalog PDF
        console.error("[PDF Route] Adding cover page")

        // Cover page
        doc.fontSize(48).font("Helvetica-Bold").text("Anillos Guillén", { align: "center" })
        doc.fontSize(16).font("Helvetica-Light").text("Catálogo de Anillos de Compromiso", { align: "center", margin: 0 })
        doc.moveDown(0.5)
        doc.fontSize(12).font("Helvetica").text("Oro de 14K con Diamante Natural Certificado", { align: "center", margin: 0 })
        doc.moveDown(3)
        doc.fontSize(11).font("Helvetica").text("Atención personalizada por WhatsApp", { align: "center" })
        doc.fontSize(11).font("Helvetica").text("+52 74 44 49 67 69", { align: "center" })

        // Add catalog page
        doc.addPage()
        console.error("[PDF Route] Adding catalog grid")

        const pageWidth = doc.page.width - 60
        const cardsPerRow = 2
        const cardWidth = (pageWidth - 10) / cardsPerRow
        const cardHeight = 200

        let cardsOnPage = 0

        // Render rings
        for (const { ring, imageBuffer } of ringDataWithImages) {
          // Calculate position
          const rowIndex = cardsOnPage % 2

          // Add new page if needed
          if (cardsOnPage > 0 && cardsOnPage % 2 === 0) {
            doc.addPage()
            cardsOnPage = 0
          }

          const xPos = 30 + rowIndex * (cardWidth + 10)
          const yPos = 30 + (cardsOnPage % 2) * (cardHeight + 20)

          // Card border
          doc.rect(xPos, yPos, cardWidth, cardHeight).stroke("#e5e7eb")

          let contentY = yPos + 10

          // Image
          if (imageBuffer) {
            try {
              const imgHeight = 90
              const imgWidth = 70
              doc.image(imageBuffer, xPos + (cardWidth - imgWidth) / 2, contentY, {
                width: imgWidth,
                height: imgHeight,
                fit: [imgWidth, imgHeight],
              })
              contentY += imgHeight + 5
            } catch (imgErr) {
              console.error(`[PDF Route] Failed to render image for ${ring.code}:`, imgErr)
              contentY += 5
            }
          }

          // Code
          doc.fontSize(11).font("Helvetica-Bold").text(ring.code, xPos + 5, contentY, { width: cardWidth - 10 })
          contentY += 16

          // Price
          if (ring.price) {
            doc.fontSize(10).font("Helvetica-Bold")
            doc.text(`$${ring.price.toLocaleString("es-MX")} MXN`, xPos + 5, contentY, { width: cardWidth - 10 })
            contentY += 12
          }

          // Diamond
          const diamondDisplay = formatDiamondTotal(
            ring.main_diamond_points || ring.diamond_points,
            ring.side_diamond_points,
          )
          doc.fontSize(9).font("Helvetica").text(`Diamante: ${diamondDisplay}`, xPos + 5, contentY, { width: cardWidth - 10 })
          contentY += 10

          // Gold
          const goldDisplay = formatGoldColor(ring.metal_color)
          doc.fontSize(9).font("Helvetica").text(`Oro: ${goldDisplay}`, xPos + 5, contentY, { width: cardWidth - 10 })

          cardsOnPage++
        }

        // Footer
        doc.moveDown(2)
        doc.fontSize(10).font("Helvetica").text("Anillos Guillén", { align: "center" })
        doc.fontSize(9).font("Helvetica").text("Acapulco, Guerrero", { align: "center", margin: 0 })
        doc.fontSize(9).font("Helvetica").text("WhatsApp: +52 74 44 49 67 69", { align: "center", margin: 0 })

        console.error("[PDF Route] Catalog complete, ending document")
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

