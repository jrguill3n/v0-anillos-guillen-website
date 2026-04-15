import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { jsPDF } from "jspdf"
import fetch from "node-fetch"

export const runtime = "nodejs"

// Fetch and convert remote image to data URL
async function fetchImageAsDataURL(imageUrl: string, ringCode: string): Promise<string | null> {
  if (!imageUrl) return null

  try {
    console.error(`[PDF Image] Fetching ${ringCode}: ${imageUrl}`)
    const response = await fetch(imageUrl, { timeout: 5000 })

    if (!response.ok) {
      console.error(`[PDF Image] ${ringCode} fetch failed: ${response.status} ${response.statusText}`)
      return null
    }

    const buffer = await response.arrayBuffer()
    console.error(`[PDF Image] ${ringCode} fetched successfully, size: ${buffer.byteLength} bytes`)

    // Convert to data URL
    const base64 = Buffer.from(buffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/jpeg"
    const dataUrl = `data:${contentType};base64,${base64}`

    console.error(`[PDF Image] ${ringCode} converted to data URL, length: ${dataUrl.length}`)
    return dataUrl
  } catch (err) {
    console.error(`[PDF Image] ${ringCode} error:`, err instanceof Error ? err.message : String(err))
    return null
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const debugMode = url.searchParams.get("debug") === "1"
  const debugImages = url.searchParams.get("debug") === "images"

  let stepReached = "init"
  let ringsCount = 0
  let errorMsg = ""

  try {
    console.error("[PDF] Route entered, debugMode=", debugMode, "debugImages=", debugImages)
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

      if (debugMode || debugImages) {
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

    // DEBUG IMAGES MODE: Test image fetching
    if (debugImages) {
      console.error("[PDF] DEBUG IMAGES mode - testing image fetching")
      stepReached = "debug_images_started"

      const imageTests = []
      if (rings) {
        for (const ring of rings.slice(0, 5)) {
          console.error(`[PDF] Testing image for ${ring.code}`)
          const dataUrl = await fetchImageAsDataURL(ring.image_url || "", ring.code)
          imageTests.push({
            code: ring.code,
            image_url: ring.image_url || null,
            fetch_success: dataUrl !== null,
            data_url_length: dataUrl ? dataUrl.length : 0,
          })
        }
      }

      return NextResponse.json({
        ok: true,
        mode: "debug_images",
        stepReached: "debug_images_complete",
        image_tests: imageTests,
      })
    }

    // Catalog PDF - 3 columns layout with images
    console.error("[PDF] Creating jsPDF document")
    stepReached = "pdf_creating"

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    console.error("[PDF] jsPDF document created")
    stepReached = "pdf_created"

    // PAGE 1: RING CATALOG (3 columns)
    console.error("[PDF] Adding catalog grid")
    stepReached = "pdf_catalog_page"

    const pageWidth = doc.internal.pageSize.getWidth() // 210mm for A4
    const pageHeight = doc.internal.pageSize.getHeight() // 297mm for A4
    const margin = 10 // Reduced margin for 3 columns
    const contentWidth = pageWidth - 2 * margin
    const cardsPerRow = 3
    const gapBetweenCards = 2 // 2mm gap between cards
    const cardWidth = (contentWidth - gapBetweenCards * 2) / cardsPerRow
    const imageHeight = 35 // Fixed image height in mm
    const cardHeight = 68 // Total card height with text

    let colIndex = 0
    let currentY = margin

    console.error("[PDF] Layout: cardWidth=", cardWidth, "cardHeight=", cardHeight, "cardsPerRow=", cardsPerRow)
    console.error("[PDF] Processing", ringsCount, "rings with images")
    stepReached = "pdf_processing_rings"

    if (rings && rings.length > 0) {
      for (const ring of rings) {
        // Check if we need a new page
        if (currentY + cardHeight + 5 > pageHeight - margin) {
          console.error("[PDF] Adding new page")
          doc.addPage()
          currentY = margin
          colIndex = 0
        }

        const cardX = margin + colIndex * (cardWidth + gapBetweenCards)
        const cardY = currentY

        // Draw card border
        doc.setDrawColor(200, 200, 200)
        doc.rect(cardX, cardY, cardWidth, cardHeight)

        let contentY = cardY + 2

        // IMAGE AREA - preserve aspect ratio
        const imageAreaX = cardX + 1
        const imageAreaY = contentY
        const imageAreaWidth = cardWidth - 2
        const imageAreaHeight = imageHeight

        if (ring.image_url) {
          try {
            const imageDataUrl = await fetchImageAsDataURL(ring.image_url, ring.code)
            if (imageDataUrl) {
              try {
                console.error(`[PDF] Rendering image for ${ring.code}`)
                // Use 'contain' behavior: fit within bounds while preserving aspect ratio
                doc.addImage(imageDataUrl, "JPEG", imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight, undefined, "FAST", "contain")
                console.error(`[PDF] Image rendered successfully for ${ring.code}`)
              } catch (renderErr) {
                console.error(`[PDF] Failed to render image for ${ring.code}:`, renderErr)
                // Draw placeholder
                doc.setDrawColor(220, 220, 220)
                doc.rect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight)
                doc.setFontSize(7)
                doc.text("No image", imageAreaX + imageAreaWidth / 2, imageAreaY + imageAreaHeight / 2, { align: "center" })
              }
            } else {
              // No image fetched - draw placeholder
              doc.setDrawColor(220, 220, 220)
              doc.rect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight)
              doc.setFontSize(7)
              doc.text("No image", imageAreaX + imageAreaWidth / 2, imageAreaY + imageAreaHeight / 2, { align: "center" })
            }
          } catch (fetchErr) {
            console.error(`[PDF] Error with image for ${ring.code}:`, fetchErr)
            // Draw placeholder
            doc.setDrawColor(220, 220, 220)
            doc.rect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight)
            doc.setFontSize(7)
            doc.text("No image", imageAreaX + imageAreaWidth / 2, imageAreaY + imageAreaHeight / 2, { align: "center" })
          }
        } else {
          // No image URL - draw placeholder
          doc.setDrawColor(220, 220, 220)
          doc.rect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight)
          doc.setFontSize(7)
          doc.text("No image", imageAreaX + imageAreaWidth / 2, imageAreaY + imageAreaHeight / 2, { align: "center" })
        }

        contentY = imageAreaY + imageAreaHeight + 2

        // Ring code
        doc.setFontSize(9)
        doc.setFont(undefined, "bold")
        doc.text(ring.code, cardX + 1.5, contentY, { maxWidth: cardWidth - 3 })
        contentY += 4

        // Price
        if (ring.price) {
          doc.setFontSize(8)
          doc.setFont(undefined, "bold")
          doc.text(`$${ring.price.toLocaleString("es-MX")}`, cardX + 1.5, contentY, { maxWidth: cardWidth - 3 })
          contentY += 3.5
        }

        // Diamond info
        const mainDiamonds = ring.main_diamond_points || ring.diamond_points || 0
        const sideDiamonds = ring.side_diamond_points || 0
        const totalDiamonds = mainDiamonds + sideDiamonds
        const diamondText = totalDiamonds > 0 ? `${totalDiamonds} pts` : "Natural"

        doc.setFontSize(7)
        doc.setFont(undefined, "normal")
        doc.text(`Diamante: ${diamondText}`, cardX + 1.5, contentY, { maxWidth: cardWidth - 3 })
        contentY += 3

        // Gold info
        const goldColor = ring.metal_color || "Amarillo"
        const goldCapitalized = goldColor.charAt(0).toUpperCase() + goldColor.slice(1).toLowerCase()
        doc.text(`Oro: ${goldCapitalized} 14K`, cardX + 1.5, contentY, { maxWidth: cardWidth - 3 })

        // Move to next column
        colIndex++
        if (colIndex >= cardsPerRow) {
          colIndex = 0
          currentY += cardHeight + 3
        }
      }
    }

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

    if (debugMode || debugImages) {
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
