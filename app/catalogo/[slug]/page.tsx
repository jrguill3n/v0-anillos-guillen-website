import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: ring } = await supabase.from("rings").select("*").eq("code", slug).single()

  if (!ring) {
    return {
      title: "Anillo no encontrado",
      description: "El anillo que buscas no está disponible en nuestro catálogo.",
    }
  }

  return {
    title: `${ring.name} (${ring.code}) - ${ring.metal_color} ${ring.metal_karat} con diamante de ${ring.diamond_points} puntos`,
    description: `${ring.description} Precio: $${ring.price?.toLocaleString("es-MX")} MXN. Disponible en Anillos Guillén Acapulco.`,
    keywords: [
      ring.code,
      ring.name,
      ring.metal_type,
      ring.metal_color,
      "anillo de compromiso",
      "diamante certificado",
      "Acapulco",
    ],
    alternates: {
      canonical: `/catalogo/${slug}`,
    },
    openGraph: {
      title: `${ring.name} (${ring.code}) - ${ring.metal_color} ${ring.metal_karat}`,
      description: ring.description,
      url: `/catalogo/${slug}`,
      type: "product",
      images: [
        {
          url: ring.image_url,
          width: 1200,
          height: 630,
          alt: `${ring.name} - Anillo de compromiso en ${ring.metal_color} ${ring.metal_karat}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${ring.name} (${ring.code}) - ${ring.metal_color} ${ring.metal_karat}`,
      description: ring.description,
      images: [ring.image_url],
    },
  }
}

export default async function RingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: ring, error } = await supabase.from("rings").select("*").eq("code", slug).eq("is_active", true).single()

  if (error || !ring) {
    console.error("[v0] Error fetching ring:", error)
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anillosguillen.com"
  const pageUrl = `${baseUrl}/catalogo/${ring.code}`
  const whatsappPhone = "5217441234567" // Replace with actual phone number from env if needed

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa este anillo de compromiso: ${ring.code} - ${ring.name}.\n\n` +
      `Detalles:\n` +
      `• Diamante: ${ring.diamond_points} puntos (${ring.diamond_clarity}, ${ring.diamond_color})\n` +
      `• Material: ${ring.metal_color} ${ring.metal_karat}\n` +
      `• Precio: $${ring.price?.toLocaleString("es-MX")} MXN\n\n` +
      `¿Me puede dar más información y opciones de diamante?\n\n` +
      `Envié la consulta desde su sitio web: ${pageUrl}`,
  )

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${ring.name} (${ring.code}) - Anillo de compromiso`,
    description: ring.description,
    image: `https://anillosguillen.com${ring.image_url}`,
    brand: {
      "@type": "Brand",
      name: "Anillos Guillén",
    },
    sku: ring.code,
    offers: {
      "@type": "Offer",
      price: ring.price,
      priceCurrency: "MXN",
      availability: ring.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "JewelryStore",
        name: "Anillos Guillén",
      },
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
    },
    material: `${ring.metal_type} ${ring.metal_color} ${ring.metal_karat}`,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Diamante",
        value: `${ring.diamond_points} puntos`,
      },
      {
        "@type": "PropertyValue",
        name: "Claridad",
        value: ring.diamond_clarity,
      },
      {
        "@type": "PropertyValue",
        name: "Color",
        value: ring.diamond_color,
      },
      {
        "@type": "PropertyValue",
        name: "Material",
        value: `${ring.metal_color} ${ring.metal_karat}`,
      },
    ],
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
            {/* Image */}
            <div className="overflow-hidden rounded-lg bg-secondary relative aspect-square">
              <Image
                src={ring.image_url || "/placeholder.svg?height=1200&width=1200"}
                alt={ring.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl">{ring.name}</h1>
              <p className="mb-2 text-sm text-muted-foreground">Código: {ring.code}</p>

              <p className="mb-6 text-3xl font-semibold text-accent">${ring.price?.toLocaleString("es-MX")} MXN</p>

              <div className="mb-6 space-y-3 border-y border-border py-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diamante:</span>
                  <span className="font-medium">{ring.diamond_points} puntos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claridad:</span>
                  <span className="font-medium">{ring.diamond_clarity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium">{ring.diamond_color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material:</span>
                  <span className="font-medium">
                    {ring.metal_color} {ring.metal_karat}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="mb-3 font-serif text-xl font-semibold">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">{ring.description}</p>
              </div>

              <Button asChild size="lg" className="mt-auto text-base">
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cotiza este modelo por WhatsApp
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
