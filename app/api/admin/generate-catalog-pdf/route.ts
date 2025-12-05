import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: rings, error } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) throw error

    // Generate simple HTML for PDF conversion
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Catálogo Anillos Guillén</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; }
    .header h1 { font-size: 36px; color: #1e3a5f; margin-bottom: 8px; }
    .header p { font-size: 14px; color: #666; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
    .ring { break-inside: avoid; page-break-inside: avoid; border: 1px solid #e5e5e5; padding: 20px; }
    .ring img { width: 100%; height: 250px; object-fit: cover; margin-bottom: 15px; }
    .ring h3 { font-size: 18px; color: #1e3a5f; margin-bottom: 8px; }
    .ring .price { font-size: 20px; color: #c8a882; font-weight: bold; margin-bottom: 8px; }
    .ring .details { font-size: 12px; color: #666; line-height: 1.6; }
    .ring .details p { margin-bottom: 4px; }
    @media print {
      body { padding: 20px; }
      .grid { gap: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Anillos Guillén</h1>
    <p>Catálogo de Anillos de Compromiso</p>
  </div>
  <div class="grid">
    ${rings
      ?.map(
        (ring) => `
      <div class="ring">
        <img src="${ring.image_url || ""}" alt="${ring.name || ring.code}" />
        <h3>${ring.code}</h3>
        ${ring.name && ring.name !== ring.code ? `<p style="font-size: 14px; margin-bottom: 8px;">${ring.name}</p>` : ""}
        ${ring.price ? `<div class="price">$${ring.price.toLocaleString("es-MX")}</div>` : ""}
        <div class="details">
          ${ring.diamond_points ? `<p><strong>Diamante:</strong> ${ring.diamond_points} puntos</p>` : ""}
          ${ring.diamond_clarity ? `<p><strong>Claridad:</strong> ${ring.diamond_clarity}</p>` : ""}
          ${ring.diamond_color ? `<p><strong>Color:</strong> ${ring.diamond_color}</p>` : ""}
          ${ring.metal_type ? `<p><strong>Metal:</strong> ${ring.metal_type}${ring.metal_karat ? ` ${ring.metal_karat}` : ""}${ring.metal_color ? ` ${ring.metal_color}` : ""}</p>` : ""}
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="catalogo-anillos-guillen.html"',
      },
    })
  } catch (error) {
    console.error("Error generating catalog:", error)
    return NextResponse.json({ error: "Failed to generate catalog" }, { status: 500 })
  }
}
