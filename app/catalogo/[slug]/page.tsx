import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

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

    const diamondInfo = safeDiamondPoints ? `${safeDiamondPoints} puntos` : "diamante"
    const metalKarat = ring.metal_karat
      ? ring.metal_karat.toString().toLowerCase().includes("k")
        ? ring.metal_karat
        : `${ring.metal_karat}k`
      : "14k"
    const metalInfo = ring.metal_color && ring.metal_karat ? `${ring.metal_color} ${metalKarat}` : "oro"

    const description =
      ring.description ||
      `${safeCode} - Hermoso anillo de compromiso con ${diamondInfo} en ${metalInfo}. Precio: $${safePrice.toLocaleString("es-MX")} MXN. Cotiza por WhatsApp.`

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
  const whatsappPhone = "5217441234567"

  const diamondInfo = safeDiamondPoints
    ? `${safeDiamondPoints} puntos${ring.diamond_clarity ? `, ${ring.diamond_clarity}` : ""}${ring.diamond_color ? `, ${ring.diamond_color}` : ""}`
    : "diamante"
  const metalKarat = ring.metal_karat
    ? ring.metal_karat.toString().toLowerCase().includes("k")
      ? ring.metal_karat
      : `${ring.metal_karat}k`
    : "14k"
  const metalInfo = ring.metal_color && ring.metal_karat ? `${ring.metal_color} ${metalKarat}` : "oro"

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa este anillo de compromiso: ${safeCode}.\n\n` +
      `Detalles:\n` +
      `• Diamante: ${diamondInfo}\n` +
      `• Oro: ${metalInfo}\n` +
      `• Precio: $${safePrice.toLocaleString("es-MX")} MXN\n\n` +
      `¿Me puede dar más información y opciones de diamante?\n\n` +
      `Envié la consulta desde su sitio web: ${pageUrl}`,
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
    material: `${ring.metal_type || "oro"} ${ring.metal_color || ""} ${ring.metal_karat || ""}`.trim(),
    additionalProperty: [
      safeDiamondPoints && {
        "@type": "PropertyValue",
        name: "Diamante",
        value: `${safeDiamondPoints} puntos`,
      },
      ring.diamond_clarity && {
        "@type": "PropertyValue",
        name: "Claridad",
        value: ring.diamond_clarity,
      },
      ring.diamond_color && {
        "@type": "PropertyValue",
        name: "Color",
        value: ring.diamond_color,
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
      <main className="min-h-screen py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <Link
            href="/catalogo"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg bg-secondary relative aspect-square">
              <Image
                src={ring.image_url || "/placeholder.svg?height=1200&width=1200"}
                alt={`${safeCode} - ${safeName}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-col">
              <h1 className="mb-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">{safeCode}</h1>
              {safeName && safeName !== safeCode && <p className="mb-6 text-lg text-muted-foreground">{safeName}</p>}

              <p className="mb-6 text-3xl font-semibold text-primary">${safePrice.toLocaleString("es-MX")} MXN</p>

              <div className="mb-6 space-y-3 border-y border-border py-6">
                {safeDiamondPoints && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diamante:</span>
                    <span className="font-medium">{safeDiamondPoints} puntos</span>
                  </div>
                )}
                {ring.diamond_clarity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Claridad:</span>
                    <span className="font-medium">{ring.diamond_clarity}</span>
                  </div>
                )}
                {ring.diamond_color && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{ring.diamond_color}</span>
                  </div>
                )}
                {(ring.metal_color || ring.metal_karat) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oro:</span>
                    <span className="font-medium">{metalInfo}</span>
                  </div>
                )}
              </div>

              {ring.description && (
                <div className="mb-8">
                  <h2 className="mb-3 font-serif text-xl font-semibold">Descripción</h2>
                  <p className="text-muted-foreground leading-relaxed">{ring.description}</p>
                </div>
              )}

              <Button asChild size="lg" className="mt-auto text-base">
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Información adicional por WhatsApp
                </a>
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Te responderemos a la brevedad para ayudarte con tu elección
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
