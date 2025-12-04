import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio"
import { Buffer } from "buffer"

const WORDPRESS_CATALOG_URL = "https://anillosguillen.com/catalogo/"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Helper function to send SSE messages
function sendLog(controller: ReadableStreamDefaultController, message: string) {
  const data = JSON.stringify({ log: message })
  controller.enqueue(`data: ${data}\n\n`)
}

function sendComplete(controller: ReadableStreamDefaultController) {
  const data = JSON.stringify({ completed: true })
  controller.enqueue(`data: ${data}\n\n`)
}

// Download image as buffer
async function downloadImage(imageUrl: string): Promise<Buffer | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error("Error downloading image:", error)
    return null
  }
}

// Upload image to Supabase Storage
async function uploadImageToSupabase(supabase: any, imageBuffer: Buffer, slug: string): Promise<string | null> {
  try {
    const fileName = `${slug}-${Date.now()}.jpg`
    const { data, error } = await supabase.storage.from("ring-images").upload(fileName, imageBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("ring-images").getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Error uploading to Supabase:", error)
    return null
  }
}

export async function POST() {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabaseUrl = process.env.SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          sendLog(controller, "Error: Missing Supabase credentials")
          controller.close()
          return
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        sendLog(controller, `Fetching catalog from ${WORDPRESS_CATALOG_URL}`)

        const response = await fetch(WORDPRESS_CATALOG_URL)
        const html = await response.text()
        const $ = cheerio.load(html)

        // Find all ring links
        const ringLinks: string[] = []
        $("a").each((_, element) => {
          const href = $(element).attr("href")
          if (href && href.includes("/catalogo/anillo-")) {
            if (!ringLinks.includes(href)) {
              ringLinks.push(href)
            }
          }
        })

        sendLog(controller, `Found ${ringLinks.length} rings to import`)

        let imported = 0
        let skipped = 0

        for (const link of ringLinks) {
          try {
            sendLog(controller, `Processing: ${link}`)

            // Fetch ring detail page
            const detailResponse = await fetch(link)
            const detailHtml = await detailResponse.text()
            const $detail = cheerio.load(detailHtml)

            // Extract slug from URL
            const urlParts = link.split("/")
            const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1]

            const h1Text = $detail("h1").first().text().trim()
            const code = h1Text || slug

            const tableText = $detail("table, .product-details, .entry-content").text()
            const textContent = $detail(".entry-content, article").text()

            // Extract price from table (format: "Precio $ 7,200.00")
            const priceMatch =
              tableText.match(/Precio[|\s]*\$\s*([\d,]+(?:\.\d{2})?)/i) ||
              textContent.match(/\$\s*([\d,]+(?:\.\d{2})?)/i)
            const price = priceMatch ? Number.parseFloat(priceMatch[1].replace(/,/g, "")) : null

            // Extract diamond points from table (format: "Diamante 5 puntos" or "15 +15 puntos")
            const diamondMatch =
              tableText.match(/Diamante[|\s]*(\d+)\s*\+?\s*(\d+)?\s*puntos?/i) ||
              textContent.match(/(\d+)\s*\+?\s*(\d+)?\s*puntos?/i)
            const diamond_points = diamondMatch
              ? Number.parseInt(diamondMatch[1]) + (diamondMatch[2] ? Number.parseInt(diamondMatch[2]) : 0)
              : null

            // Extract gold info from table (format: "Oro Blanco 14k")
            const goldMatch =
              tableText.match(/Oro[|\s]*(amarillo|blanco|rosa|rose)\s*(\d+)\s*k/i) ||
              textContent.match(/(amarillo|blanco|rosa|rose)\s*(\d+)\s*k/i)
            const metal_color = goldMatch ? goldMatch[1].toLowerCase() : null
            const metal_karat = goldMatch ? Number.parseInt(goldMatch[2]) : null

            let description = $detail(".entry-content p").first().text().trim()
            if (!description || description.length < 10) {
              description = `${code} - Anillo de compromiso con diamante de ${diamond_points || 0} puntos en oro ${metal_color || ""} de ${metal_karat || 14}k`
            }

            let image_url = "/solitaire-diamond-ring.png"

            const imgElement = $detail(".wp-post-image, .product-image img, article img, .entry-content img").first()
            const parentLink = imgElement.parent("a")

            let imgSrc = null

            // Try parent link href first (WordPress often links to full size image)
            if (parentLink.length && parentLink.attr("href")) {
              const linkHref = parentLink.attr("href")
              if (linkHref && linkHref.startsWith("http") && /\.(jpg|jpeg|png|webp)$/i.test(linkHref)) {
                imgSrc = linkHref
                sendLog(controller, `  Found image in parent link: ${imgSrc}`)
              }
            }

            // Fallback to img attributes
            if (!imgSrc) {
              imgSrc =
                imgElement.attr("data-src") ||
                imgElement.attr("data-lazy-src") ||
                imgElement.attr("data-large_image") ||
                imgElement.attr("srcset")?.split(" ")[0] ||
                imgElement.attr("src")
            }

            if (imgSrc && !imgSrc.includes("data:image") && imgSrc.startsWith("http")) {
              sendLog(controller, `  Downloading image: ${imgSrc.substring(0, 60)}...`)
              const imageBuffer = await downloadImage(imgSrc)
              if (imageBuffer) {
                sendLog(controller, `  Uploading to Supabase Storage...`)
                const uploadedUrl = await uploadImageToSupabase(supabase, imageBuffer, slug)
                if (uploadedUrl) {
                  image_url = uploadedUrl
                  sendLog(controller, `  ✅ Image uploaded successfully`)
                } else {
                  sendLog(controller, `  ⚠️ Image upload failed, using placeholder`)
                }
              } else {
                sendLog(controller, `  ⚠️ Image download failed, using placeholder`)
              }
            } else {
              sendLog(controller, `  ⚠️ No valid image found, using placeholder`)
            }

            const ringData = {
              code,
              slug,
              name: code, // Use the code as name for consistency
              description: description.substring(0, 500).trim(),
              price,
              diamond_points,
              metal_color,
              metal_karat,
              metal_type: "oro",
              image_url,
              is_active: true,
              order_index: 0,
            }

            const { error } = await supabase.from("rings").upsert(ringData, {
              onConflict: "slug",
              ignoreDuplicates: false,
            })

            if (error) {
              sendLog(controller, `  ❌ Error: ${error.message}`)
              skipped++
            } else {
              sendLog(controller, `  ✅ Imported: ${ringData.code}`)
              imported++
            }
          } catch (error) {
            sendLog(controller, `  ❌ Error processing ring: ${error}`)
            skipped++
          }
        }

        sendLog(controller, `\n=== Import Summary ===`)
        sendLog(controller, `Total rings found: ${ringLinks.length}`)
        sendLog(controller, `Successfully imported: ${imported}`)
        sendLog(controller, `Skipped/Failed: ${skipped}`)

        sendComplete(controller)
        controller.close()
      } catch (error) {
        sendLog(controller, `Fatal error: ${error}`)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
