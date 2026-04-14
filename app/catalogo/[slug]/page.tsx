import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { formatGoldInfo, formatKarat, formatRingDescription } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: ring } = await supabase.from("rings").select("*").eq("slug", slug).single()

    if (!ring) {
      return {
        title: "Anillo no encontrado | Anillos Guillén",
        description: "El anillo que buscas no está disponible en este momento.",
      }
    }

    const safeCode = ring.code && ring.code !== "Anillos Guillén" ? ring.code : `Anillo ${slug.split("-").pop()}`
    const safeName = ring.name && ring.name !== "Anillos Guillén" ? ring.name : safeCode
    const safePrice = ring.price && !isNaN(Number(ring.price)) ? Number(ring.price) : 0
    const safeDiamondPoints =
      ring.diamond_points && !isNaN(Number(ring.diamond_points)) ? Number(ring.diamond_points) : null

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anillosguillen.com"
    const pageUrl = `${baseUrl}/catalogo/${ring.slug}`

    const description = formatRingDescription(
      ring.description,
      safeCode,
      safeDiamondPoints,
      ring.metal_color,
      ring.metal_karat,
    )

    return {
      title: `${safeCode} - Anillo de compromiso | Anillos Guillén`,
      description: description.slice(0, 160),
      openGraph: {
        title: `${safeCode} - ${safeName}`,
        description: description.slice(0, 160),
        url: pageUrl,
        siteName: "Anillos Guillén",
        images: [
          {
            url: ring.image_url || `${baseUrl}/placeholder.svg`,
            width: 1200,
            height: 1200,
            alt: `${safeCode} - Anillo de compromiso`,
          },
        ],
        locale: "es_MX",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${safeCode} - ${safeName}`,
        description: description.slice(0, 160),
        images: [ring.image_url || `${baseUrl}/placeholder.svg`],
      },
    }
  } catch (error) {
    // Return default metadata if anything fails
    return {
      title: "Anillo de compromiso | Anillos Guillén",
      description: "Hermoso anillo de compromiso disponible en Anillos Guillén.",
    }
  }
}

export default async function RingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: ring, error } = await supabase.from("rings").select("*").eq("slug", slug).single()

  console.log(`[v0] Ring detail page for ${slug}: ${ring ? "found" : "not found"} at ${new Date().toISOString()}`)

  if (error || !ring) {
    notFound()
  }

  const safeCode = ring.code && ring.code !== "Anillos Guillén" ? ring.code : `Anillo ${slug.split("-").pop()}`
  const safeName = ring.name && ring.name !== "Anillos Guillén" ? ring.name : safeCode
  const safePrice = ring.price && !isNaN(Number(ring.price)) ? Number(ring.price) : 0
  const safeDiamondPoints =
    ring.diamond_points && !isNaN(Number(ring.diamond_points)) ? Number(ring.diamond_points) : null

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anillosguillen.com"
  const pageUrl = `${baseUrl}/catalogo/${ring.slug}`
  const whatsappPhone = "527444496769"

  const diamondInfo = safeDiamondPoints
    ? `diamante natural de ${safeDiamondPoints} puntos`
    : "diamante natural"
  const metalInfo = formatGoldInfo(ring.metal_color, ring.metal_karat)

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa este anillo de compromiso: ${safeCode}.\n\n` +
      `Detalles:\n` +
      `• Diamante: ${diamondInfo}\n` +
      `• Oro: ${metalInfo}\n` +
      `• Precio: $${safePrice.toLocaleString("es-MX")} MXN\n\n` +
      `¿Me puede dar más información y opciones de diamante?\n\n` +
      `Envié la consulta desde su sitio web: ${pageUrl}`,
  )

  const generatedDescription = formatRingDescription(
    ring.description,
    safeCode,
    safeDiamondPoints,
    ring.metal_color,
    ring.metal_karat,
  )

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${safeCode} - Anillo de compromiso`,
    description: ring.description || "Hermoso anillo de compromiso",
    image: ring.image_url || `${baseUrl}/placeholder.svg`,
    brand: {
      "@type": "Brand",
      name: "Anillos Guillén",
    },
    sku: safeCode,
    offers: {
      "@type": "Offer",
      price: safePrice,
      priceCurrency: "MXN",
      availability: ring.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "JewelryStore",
        name: "Anillos Guillén",
      },
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
    },
    material: `${ring.metal_type || "oro"} ${ring.metal_color || ""} ${formatKarat(ring.metal_karat)}`.trim(),
    additionalProperty: [
      safeDiamondPoints && {
        "@type": "PropertyValue",
        name: "Diamante",
        value: `${safeDiamondPoints} puntos`,
      },
      (ring.metal_color || ring.metal_karat) && {
        "@type": "PropertyValue",
        name: "Oro",
        value: metalInfo,
      },
    ].filter(Boolean),
    category: "Anillos de compromiso",
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          {/* Back Link */}
          <Link
            href="/catalogo"
            className="mb-12 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Image Section */}
            <div className="flex items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-sm bg-slate-50">
                <Image
                  src={ring.image_url || "/placeholder.svg?height=800&width=800"}
                  alt={`${safeCode} - ${safeName}`}
                  width={800}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col">
              {/* Title and Code */}
              <div className="mb-8 md:mb-10">
                <p className="text-sm tracking-widest text-muted-foreground uppercase mb-3">{safeCode}</p>
                <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mb-6">
                  Anillo de Compromiso
                </h1>
              </div>

              {/* Price */}
              <div className="mb-8 md:mb-10">
                <p className="text-4xl md:text-5xl font-light tracking-tight">
                  ${safePrice.toLocaleString("es-MX")}
                  <span className="text-lg text-muted-foreground ml-2">MXN</span>
                </p>
              </div>

              {/* Specifications */}
              <div className="mb-8 md:mb-12 pb-8 md:pb-10 border-b border-slate-200">
                <div className="space-y-4">
                  {safeDiamondPoints && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Diamante</span>
                      <span className="text-base font-light">{safeDiamondPoints} puntos</span>
                    </div>
                  )}
                  {(ring.metal_color || ring.metal_karat) && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Oro</span>
                      <span className="text-base font-light">{metalInfo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {generatedDescription && (
                <div className="mb-10 md:mb-12">
                  <p className="text-base leading-relaxed text-slate-700">{generatedDescription}</p>
                </div>
              )}

              {/* Support Text */}
              <div className="mb-8 md:mb-10 pb-8 md:pb-10 border-b border-slate-200">
                <p className="text-sm text-muted-foreground">
                  Atención personalizada previa cita. Te asesoramos por WhatsApp y en tienda.
                </p>
              </div>

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-normal rounded-sm py-6 text-base mb-4"
              >
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cotizar por WhatsApp
                </a>
              </Button>

              {/* Secondary CTA Text */}
              <p className="text-center text-sm text-muted-foreground">
                Respuesta rápida • Sin compromiso
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
