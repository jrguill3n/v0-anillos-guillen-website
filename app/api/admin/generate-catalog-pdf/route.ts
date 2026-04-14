import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit"

export const runtime = "nodejs"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: rings, error } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) throw error

    // Create a PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
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

      // Add title
      doc.fontSize(24).font("Helvetica-Bold").text("Anillos Guillén", { align: "center" })
      doc.fontSize(12).font("Helvetica").text("Catálogo de Anillos de Compromiso", { align: "center", margin: 0 })
      doc.moveDown()

      // Add rings
      rings?.forEach((ring, index) => {
        // Add page break if needed (roughly 3-4 rings per page)
        if (index > 0 && index % 3 === 0) {
          doc.addPage()
        }

        // Ring details
        doc.fontSize(14).font("Helvetica-Bold").text(ring.code)

        if (ring.name && ring.name !== ring.code) {
          doc.fontSize(11).font("Helvetica").text(ring.name, { margin: 0 })
        }

        // Price
        if (ring.price) {
          doc
            .fontSize(13)
            .font("Helvetica-Bold")
            .text(`$${ring.price.toLocaleString("es-MX")} MXN`, { margin: 0 })
        }

        // Diamond info
        if (ring.diamond_points) {
          doc.fontSize(10).font("Helvetica").text(`Diamante: ${ring.diamond_points} puntos`, { margin: 0 })
        }

        // Metal info
        if (ring.metal_type || ring.metal_karat || ring.metal_color) {
          const metalInfo = [ring.metal_type, ring.metal_color, ring.metal_karat].filter(Boolean).join(" ")
          doc.fontSize(10).font("Helvetica").text(`Metal: ${metalInfo}`, { margin: 0 })
        }

        doc.moveDown(0.5)
      })

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

