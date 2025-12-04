import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    // Dynamically import @react-pdf/renderer to avoid build-time issues
    const { renderToBuffer } = await import("@react-pdf/renderer")
    const { CatalogDocument } = await import("@/lib/pdf/catalog-document")

    // Fetch all active rings from the database
    const supabase = await createClient()
    const { data: rings, error } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching rings for PDF:", error)
      return NextResponse.json({ error: "Failed to fetch rings" }, { status: 500 })
    }

    if (!rings || rings.length === 0) {
      return NextResponse.json({ error: "No active rings found" }, { status: 404 })
    }

    const buffer = await renderToBuffer(<CatalogDocument rings={rings} />)

    // Return PDF as response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.pdf"',
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
