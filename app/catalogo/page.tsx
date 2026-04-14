import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { formatGoldInfo } from "@/lib/utils"
import { CatalogSortDropdown } from "@/components/catalog-sort-dropdown"

export const metadata: Metadata = {
  title: "Catálogo de Anillos de Compromiso | Anillos Guillén",
  description:
    "Descubre nuestro catálogo de anillos de compromiso en oro amarillo, blanco y rosa de 14K y 18K con diamantes naturales. Diseños elegantes, atención personalizada y certificados de autenticidad en Acapulco.",
  keywords: [
    "anillos de compromiso",
    "anillos de compromiso Acapulco",
    "anillos de oro",
    "oro 14K",
    "oro 18K",
    "diamantes naturales",
    "anillos de boda",
    "catálogo anillos",
    "modelos anillos",
    "anillos de diamante",
  ],
  alternates: {
    canonical: "https://anillosguillen.com/catalogo",
  },
  openGraph: {
    title: "Catálogo de Anillos de Compromiso - Anillos Guillén",
    description:
      "Explora nuestra colección completa de anillos de compromiso en oro de 14K y 18K con diamantes naturales certificados.",
    url: "https://anillosguillen.com/catalogo",
    type: "website",
    locale: "es_MX",
    siteName: "Anillos Guillén",
    images: [
      {
        url: "https://anillosguillen.com/white-gold-diamond-solitaire-engagement-ring.jpg",
        width: 1200,
        height: 630,
        alt: "Catálogo de anillos de compromiso - Anillos Guillén",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Anillos de Compromiso - Anillos Guillén",
    description:
      "Descubre diseños elegantes de anillos de compromiso en oro con diamantes naturales certificados.",
    images: ["https://anillosguillen.com/white-gold-diamond-solitaire-engagement-ring.jpg"],
  },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

type SortOption = "price_asc" | "price_desc"

interface CatalogoPageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const params = await searchParams
  const sortParam = (params.sort || "price_asc") as SortOption

  const correlationId = logDbConnection("LIST_CATALOG")

  let rings = []
  let error = null

  try {
    const supabase = await createClient()

    console.log(`[v0] [${correlationId}] LIST_CATALOG: Fetched ${rings.length} rings at ${new Date().toISOString()}`)

    let query = supabase.from("rings").select("*").eq("is_active", true)

    // Apply sorting based on the sort parameter
    switch (sortParam) {
      case "price_desc":
        query = query.order("price", { ascending: false })
        break
      case "price_asc":
      default:
        query = query.order("price", { ascending: true })
        break
    }

    const result = await query

    if (result.error) {
      error = result.error
      console.error(`[v0] [${correlationId}] LIST_CATALOG: Error:`, error)
    } else {
      rings = result.data || []
      console.log(`[v0] [${correlationId}] LIST_CATALOG: Fetched ${rings.length} rings at ${new Date().toISOString()}`)
    }
  } catch (e) {
    error = e
    console.error(`[v0] [${correlationId}] LIST_CATALOG: Exception:`, e)
  }

  const validRings = rings.filter((ring) => {
    return ring.slug && ring.code && ring.image_url && ring.price != null
  })

  if (error) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error al cargar el catálogo</h1>
            <p className="text-muted-foreground">
              No pudimos conectar con la base de datos. Por favor intenta más tarde.
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Catálogo de Anillos de Compromiso",
            description:
              "Descubre nuestro catálogo de anillos de compromiso en oro de 14K y 18K con diamantes naturales certificados.",
            url: "https://anillosguillen.com/catalogo",
            publisher: {
              "@type": "LocalBusiness",
              name: "Anillos Guillén",
              location: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "MX",
                  addressRegion: "Guerrero",
                  addressLocality: "Acapulco",
                },
              },
            },
          }),
        }}
      />
      <Navigation />
      <main className="min-h-screen">
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight md:text-6xl">
                Catálogo de Anillos de Compromiso
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Descubre nuestra colección de anillos de compromiso en oro de 14K y 18K con diamantes naturales
                certificados. Cada pieza es única y está elaborada con los más altos estándares de calidad.
              </p>
            </div>

            {validRings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  Próximamente estaremos agregando nuevos modelos.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8 flex justify-end">
                  <CatalogSortDropdown currentSort={sortParam} />
                </div>

                <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {validRings.map((ring) => (
                    <Link key={ring.id} href={`/catalogo/${ring.slug}`}>
                      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                        <div className="aspect-square overflow-hidden bg-secondary relative">
                          <Image
                            src={ring.image_url || "/placeholder.svg?height=800&width=800"}
                            alt={`${ring.code || "Anillo"} - ${ring.name || "Anillo de compromiso"}`}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-4 md:p-6">
                          <h3 className="mb-1 text-xs md:text-sm font-medium text-muted-foreground">{ring.code}</h3>
                          <p className="mb-2 md:mb-3 text-base md:text-lg font-semibold text-foreground">
                            ${(ring.price || 0).toLocaleString("es-MX")} MXN
                          </p>
                          <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                            <p>Diamante: {ring.diamond_points || 0} puntos</p>
                            <p>Oro: {formatGoldInfo(ring.metal_color, ring.metal_karat)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
