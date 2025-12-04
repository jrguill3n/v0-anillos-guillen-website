/**
 * WordPress Catalog Importer
 *
 * This script imports the jewelry catalog from the existing WordPress site
 * (https://anillosguillen.com/catalogo/) into the Postgres database.
 *
 * How to run:
 *   pnpm install (to ensure dependencies are installed)
 *   pnpm import:wordpress
 *
 * Or directly:
 *   npx tsx scripts/importFromWordpress.ts
 *
 * Make sure you have these environment variables set:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio"
import { fetch } from "node-fetch"
import { Buffer } from "buffer"

// Types
interface RingData {
  slug: string
  code: string
  name: string
  description: string
  price: number // changed from price_mxn to price
  diamond_points: number
  metal_type: string
  metal_karat: string
  metal_color: string
  diamond_clarity: string | null
  diamond_color: string | null
  image_url: string
  order_index: number
  is_active: boolean
}

interface ParsedRing {
  code: string
  price: number
  diamondPoints: number
  goldColor: string
  goldKarat: number
  detailUrl: string
  slug: string
}

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:")
  console.error("   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)")
  console.error("   SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CATALOG_URL = "https://anillosguillen.com/catalogo/"
const BASE_URL = "https://anillosguillen.com"

/**
 * Fetch HTML content from a URL
 */
async function fetchHTML(url: string): Promise<string> {
  console.log(`📥 Fetching: ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

/**
 * Parse a ring's text content to extract details
 * Example: "Anillo 0922 $ 7,200.00 Diamante: 5 puntos Oro: Amarillo 14k"
 * Example: "Anillo 0135 $ 12,500.00 Diamante: 15 +15 puntos Oro: Blanco 14k"
 */
function parseRingText(text: string): Partial<ParsedRing> | null {
  const cleanText = text.trim().replace(/\s+/g, " ")

  // Extract code (e.g., "Anillo 0922")
  const codeMatch = cleanText.match(/Anillo\s+(\d+)/i)
  if (!codeMatch) return null
  const code = `Anillo ${codeMatch[1]}`

  // Extract price (e.g., "$ 7,200.00" or "$7,200.00")
  const priceMatch = cleanText.match(/\$\s*([\d,]+\.?\d*)/i)
  const price = priceMatch ? Number.parseFloat(priceMatch[1].replace(/,/g, "")) : 0

  const diamondText = cleanText.match(/Diamante:\s*([^O]+)Oro:/i)?.[1] || ""
  let diamondPoints = 0

  // Check for "+" pattern (e.g., "15 +15" or "26+21")
  const plusMatch = diamondText.match(/(\d+)\s*\+\s*(\d+)/i)
  if (plusMatch) {
    diamondPoints = Number.parseInt(plusMatch[1], 10) + Number.parseInt(plusMatch[2], 10)
  } else {
    // Single number pattern (e.g., "5 puntos")
    const singleMatch = diamondText.match(/(\d+)\s*punto/i)
    diamondPoints = singleMatch ? Number.parseInt(singleMatch[1], 10) : 0
  }

  // Extract gold color and karat (e.g., "Amarillo 14k")
  const goldMatch = cleanText.match(/Oro:\s*(Blanco|Amarillo|Rosa)\s*(\d+)k/i)
  const goldColor = goldMatch ? goldMatch[1] : "Amarillo"
  const goldKarat = goldMatch ? Number.parseInt(goldMatch[2], 10) : 14

  return {
    code,
    price,
    diamondPoints,
    goldColor,
    goldKarat,
  }
}

/**
 * Parse the catalog page and extract all ring entries
 */
async function parseCatalogPage(): Promise<ParsedRing[]> {
  const html = await fetchHTML(CATALOG_URL)
  const $ = cheerio.load(html)
  const rings: ParsedRing[] = []

  $('a[href*="/catalogo/anillo-"]').each((_, element) => {
    const $link = $(element)
    const href = $link.attr("href")
    if (!href) return

    // Get the h3 heading text (ring code like "Anillo 0122")
    const $heading = $link.find("h3")
    const headingText = $heading.text().trim()

    // Get all text from the link
    const fullText = $link.text().trim()

    // Extract slug from URL
    const urlMatch = href.match(/\/catalogo\/([^/?#]+)/i)
    const slug = urlMatch ? urlMatch[1].replace(/\/$/, "") : ""

    if (!slug || !headingText.includes("Anillo")) return

    const parsed = parseRingText(fullText)
    if (!parsed || !parsed.code) return

    const detailUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`

    rings.push({
      code: parsed.code,
      price: parsed.price || 0,
      diamondPoints: parsed.diamondPoints || 0,
      goldColor: parsed.goldColor || "Amarillo",
      goldKarat: parsed.goldKarat || 14,
      detailUrl,
      slug,
    })
  })

  console.log(`✅ Found ${rings.length} rings in catalog`)

  if (rings.length === 0) {
    console.log("\n⚠️  No rings found. Dumping first 500 chars of HTML:")
    console.log($.html().substring(0, 500))
  }

  return rings
}

/**
 * Download an image from a URL and return as a Buffer
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    console.log(`  📥 Downloading image from ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`  ⚠️  Failed to download image: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.warn(`  ⚠️  Error downloading image:`, error)
    return null
  }
}

/**
 * Upload an image to Supabase Storage and return the public URL
 */
async function uploadImageToSupabase(imageBuffer: Buffer, slug: string): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = "jpg" // default to jpg
    const fileName = `${slug}-${Date.now()}.${fileExt}`
    const filePath = `rings/${fileName}`

    console.log(`  📤 Uploading to Supabase Storage: ${filePath}`)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("ring-images").upload(filePath, imageBuffer, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.warn(`  ⚠️  Upload error: ${uploadError.message}`)
      return null
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("ring-images").getPublicUrl(filePath)

    console.log(`  ✅ Image uploaded successfully`)
    return publicUrl
  } catch (error) {
    console.warn(`  ⚠️  Error uploading to Supabase:`, error)
    return null
  }
}

/**
 * Fetch the detail page for a ring and extract the main product image
 */
async function fetchRingImage(detailUrl: string, slug: string): Promise<string> {
  try {
    const html = await fetchHTML(detailUrl)
    const $ = cheerio.load(html)

    let imageUrl = ""

    // First, try to find the main product image in common WordPress/WooCommerce locations
    const selectors = [
      ".woocommerce-product-gallery__image img",
      ".product-images img",
      "article.product img",
      ".entry-content img",
      "article img",
      ".post-content img",
      "main img",
    ]

    for (const selector of selectors) {
      const $img = $(selector).first()
      const src = $img.attr("src") || $img.attr("data-src") || ""

      if (src && !src.includes("logo") && !src.includes("icon")) {
        imageUrl = src
        break
      }
    }

    // Make absolute URL if needed
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = imageUrl.startsWith("/") ? `${BASE_URL}${imageUrl}` : `${BASE_URL}/${imageUrl}`
    }

    if (!imageUrl) {
      console.warn(`  ⚠️  No image found for ${detailUrl}`)
      return "/placeholder.svg?height=400&width=400"
    }

    const imageBuffer = await downloadImage(imageUrl)
    if (!imageBuffer) {
      console.warn(`  ⚠️  Could not download image, using placeholder`)
      return "/placeholder.svg?height=400&width=400"
    }

    const supabaseUrl = await uploadImageToSupabase(imageBuffer, slug)
    if (!supabaseUrl) {
      console.warn(`  ⚠️  Could not upload image to Supabase, using placeholder`)
      return "/placeholder.svg?height=400&width=400"
    }

    return supabaseUrl
  } catch (error) {
    console.warn(`  ⚠️  Could not fetch image from ${detailUrl}:`, error)
    return "/placeholder.svg?height=400&width=400"
  }
}

/**
 * Convert a ParsedRing to RingData for database insertion
 */
async function buildRingData(ring: ParsedRing, orderIndex: number): Promise<RingData> {
  console.log(`📸 Fetching and uploading image for ${ring.code}...`)
  const imageUrl = await fetchRingImage(ring.detailUrl, ring.slug)

  const metalType = `Oro ${ring.goldColor}`
  const description = `${ring.code} en oro ${ring.goldColor} ${ring.goldKarat}k con diamante de ${ring.diamondPoints} puntos.`

  return {
    slug: ring.slug,
    code: ring.code,
    name: ring.code,
    description,
    price: ring.price, // changed from price_mxn to price
    diamond_points: ring.diamondPoints,
    metal_type: metalType,
    metal_karat: `${ring.goldKarat}k`,
    metal_color: ring.goldColor,
    diamond_clarity: null,
    diamond_color: null,
    image_url: imageUrl,
    order_index: orderIndex,
    is_active: true,
  }
}

/**
 * Upsert a ring into the database
 */
async function upsertRing(ringData: RingData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("rings").upsert(ringData, { onConflict: "slug" })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Main import function
 */
async function main() {
  console.log("🚀 Starting WordPress catalog import...\n")

  try {
    // Parse the catalog page
    const rings = await parseCatalogPage()

    if (rings.length === 0) {
      console.log("❌ No rings found in catalog. Check the parsing logic.")
      process.exit(1)
    }

    console.log(`\n📦 Processing ${rings.length} rings...\n`)

    // Process each ring
    let successCount = 0
    let failCount = 0
    const failedRings: Array<{ code: string; error: string }> = []

    for (let i = 0; i < rings.length; i++) {
      const ring = rings[i]
      const orderIndex = i + 1

      console.log(`[${orderIndex}/${rings.length}] Processing ${ring.code}...`)

      try {
        const ringData = await buildRingData(ring, orderIndex)
        const result = await upsertRing(ringData)

        if (result.success) {
          console.log(`✅ ${ring.code} - Imported successfully`)
          successCount++
        } else {
          console.log(`❌ ${ring.code} - Failed: ${result.error}`)
          failedRings.push({ code: ring.code, error: result.error || "Unknown error" })
          failCount++
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.log(`❌ ${ring.code} - Failed: ${errorMsg}`)
        failedRings.push({ code: ring.code, error: errorMsg })
        failCount++
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Print summary
    console.log("\n" + "=".repeat(60))
    console.log("📊 Import Summary")
    console.log("=".repeat(60))
    console.log(`✅ Successfully imported: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📦 Total processed: ${rings.length}`)

    if (failedRings.length > 0) {
      console.log("\n❌ Failed rings:")
      failedRings.forEach(({ code, error }) => {
        console.log(`   - ${code}: ${error}`)
      })
    }

    console.log("\n✨ Import completed!")
  } catch (error) {
    console.error("\n❌ Fatal error during import:", error)
    process.exit(1)
  }
}

// Run the script
main()
