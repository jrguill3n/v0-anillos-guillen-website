import { NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import { createClient } from "@/lib/supabase/server"
import { CatalogDocument } from "@/lib/pdf/catalog-document"

export async function GET() {
  try {
    // Fetch all active rings from the database
    const supabase = await createClient()
    const { data: rings, error } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching rings for PDF:", error)
      return NextResponse.json({ error: "Failed to fetch rings" }, { status: 500 })
    }

    if (!rings || rings.length === 0) {
      return NextResponse.json({ error: "No active rings found" }, { status: 404 })
    }

    // Generate PDF document
    const stream = await renderToStream(<CatalogDocument rings={rings} />)

    // Return PDF as response
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
