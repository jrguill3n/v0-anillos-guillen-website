import { NextResponse } from "next/server"
import PDFDocument from "pdfkit"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Create a simple PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    })

    // Collect PDF chunks
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    return new Promise<NextResponse>((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
            },
          }),
        )
      })

      doc.on("error", reject)

      // Minimal test content
      doc.fontSize(24).text("Anillos Guillen", { align: "center" })
      doc.moveDown()
      doc.fontSize(14).text("Test PDF - Phase 1", { align: "center" })
      doc.moveDown()
      doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`, { align: "center" })

      doc.end()
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return new Response("PDF generation failed", { status: 500 })
  }
}
