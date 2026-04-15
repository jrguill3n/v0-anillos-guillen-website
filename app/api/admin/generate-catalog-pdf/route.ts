import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit"
import fetch from "node-fetch"

export const runtime = "nodejs"

// Helper to format diamond info like in the catalog (total points only)
function formatDiamondTotal(mainPoints: number | null | undefined, sidePoints: number | null | undefined): string {
  const main = mainPoints && !isNaN(Number(mainPoints)) ? Number(mainPoints) : 0
  const side = sidePoints && !isNaN(Number(sidePoints)) && Number(sidePoints) > 0 ? Number(sidePoints) : 0
  const total = main + side
  if (total === 0) return "Diamante natural"
  return `${total} puntos`
}

// Helper to fetch image as buffer
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: rings, error } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) throw error

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 30,
      bufferPages: true,
    })

    // Stream to buffer
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
              "Content-Length": pdfBuffer.length.toString(),
            },
          }),
        )
      })

      doc.on("error", (err) => {
        reject(err)
      })

      // ========== COVER PAGE ==========
      doc.fontSize(48).font("Helvetica-Bold").text("Anillos Guillén", { align: "center" })
      doc.fontSize(16).font("Helvetica-Light").text("Catálogo de Anillos de Compromiso", { align: "center", margin: 0 })
      doc.moveDown(0.5)
      doc.fontSize(12).font("Helvetica").text("Oro de 14K con Diamante Natural Certificado", { align: "center", margin: 0 })
      doc.moveDown(3)
      doc.fontSize(11).font("Helvetica").text("Atención personalizada por WhatsApp", { align: "center" })
      doc.fontSize(11).font("Helvetica").text("+52 74 44 49 67 69", { align: "center" })

      // Add page break
      doc.addPage()

      // ========== RINGS GRID ==========
      const pageHeight = doc.page.height - 60 // Accounting for margins
      const pageWidth = doc.page.width - 60
      const cardsPerRow = 2
      const cardWidth = (pageWidth - 10) / cardsPerRow // 10 is gap
      const cardHeight = 200

      let currentCard = 0
      let cardsOnPage = 0
      const cardsPerPage = 3 // 3 cards per page (2x2 grid with space) = 6 cards per 2-page layout

      // Process rings
      if (rings && rings.length > 0) {
        for (const ring of rings) {
          // Calculate position
          const rowIndex = cardsOnPage % 2
          const pagePosition = Math.floor(cardsOnPage / 2)

          // Add new page if needed
          if (pagePosition > 0 && cardsOnPage % 2 === 0) {
            doc.addPage()
            cardsOnPage = 0
          }

          const xPos = 30 + rowIndex * (cardWidth + 10)
          const yPos = 30 + (cardsOnPage % 2) * (cardHeight + 20)

          // Draw card background (subtle border)
          doc.rect(xPos, yPos, cardWidth, cardHeight).stroke("#e5e7eb")

          let contentY = yPos + 10

          // Try to add ring image
          if (ring.image_url) {
            try {
              const imageBuffer = await fetchImageBuffer(ring.image_url)
              if (imageBuffer) {
                const imgHeight = 100
                doc.image(imageBuffer, xPos + (cardWidth - 80) / 2, contentY, {
                  width: 80,
                  height: imgHeight,
                  fit: [80, imgHeight],
                })
                contentY += imgHeight + 5
              }
            } catch {
              // Skip image on error
            }
          }

          // Ring code
          doc.fontSize(12).font("Helvetica-Bold").text(ring.code, xPos + 5, contentY, { width: cardWidth - 10 })
          contentY += 18

          // Price
          if (ring.price) {
            doc.fontSize(11).font("Helvetica-Bold")
            doc.text(`$${ring.price.toLocaleString("es-MX")} MXN`, xPos + 5, contentY, { width: cardWidth - 10 })
            contentY += 15
          }

          // Diamond info
          const diamondDisplay = formatDiamondTotal(
            ring.main_diamond_points || ring.diamond_points,
            ring.side_diamond_points,
          )
          doc.fontSize(9).font("Helvetica").text(`Diamante natural: ${diamondDisplay}`, xPos + 5, contentY, {
            width: cardWidth - 10,
          })
          contentY += 12

          // Gold info
          const goldColor = ring.metal_color || "Amarillo"
          const goldDisplay = `${goldColor.charAt(0).toUpperCase() + goldColor.slice(1).toLowerCase()} 14K`
          doc.fontSize(9).font("Helvetica").text(`Oro: ${goldDisplay}`, xPos + 5, contentY, {
            width: cardWidth - 10,
          })

          cardsOnPage++
        }
      }

      // Add footer with contact info on last page
      doc.moveDown(2)
      doc.fontSize(10).font("Helvetica").text("Anillos Guillén", { align: "center" })
      doc.fontSize(9).font("Helvetica").text("Acapulco, Guerrero", { align: "center", margin: 0 })
      doc.fontSize(9).font("Helvetica").text("WhatsApp: +52 74 44 49 67 69", { align: "center", margin: 0 })

      // Finish the PDF
      doc.end()
    })
  } catch (error) {
    console.error("Error generating catalog PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate catalog PDF", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

