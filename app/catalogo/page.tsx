import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Catálogo de Anillos de Compromiso",
  description:
    "Explora nuestra variedad de modelos de anillos de compromiso en oro amarillo, blanco y rosa. Diferentes puntos de diamante (50 a 120 puntos) y quilates de oro (14k y 18k). Encuentra el anillo perfecto.",
  keywords: [
    "catálogo anillos",
    "anillos de compromiso modelos",
    "oro 14k",
    "oro 18k",
    "diamantes certificados",
    "puntos diamante",
    "oro amarillo",
    "oro blanco",
    "oro rosa",
  ],
  alternates: {
    canonical: "/catalogo",
  },
  openGraph: {
    title: "Catálogo de Anillos de Compromiso - Anillos Guillén",
    description:
      "Explora nuestra variedad de modelos de anillos de compromiso en oro amarillo, blanco y rosa. Diferentes puntos de diamante y quilates de oro.",
    url: "/catalogo",
    type: "website",
    images: [
      {
        url: "/white-gold-diamond-solitaire-engagement-ring.jpg",
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
      "Explora nuestra variedad de modelos de anillos de compromiso en oro amarillo, blanco y rosa. Diferentes puntos de diamante y quilates de oro.",
    images: ["/white-gold-diamond-solitaire-engagement-ring.jpg"],
  },
}

export const revalidate = 3600 // Revalidate every hour

export default async function CatalogoPage() {
  const supabase = await createClient()
  const { data: rings, error } = await supabase
    .from("rings")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching rings:", error)
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight md:text-6xl">Catálogo de Anillos</h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Descubre nuestra colección de anillos de compromiso. Cada pieza es única y está elaborada con los más
                altos estándares de calidad.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rings?.map((ring) => (
                <Link key={ring.id} href={`/catalogo/${ring.code}`}>
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/20">
                    <div className="aspect-square overflow-hidden bg-secondary relative">
                      <Image
                        src={ring.image_url || "/placeholder.svg?height=800&width=800"}
                        alt={ring.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="mb-3 font-serif text-xl font-semibold">{ring.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="text-lg font-semibold text-foreground">
                          ${ring.price_mxn?.toLocaleString("es-MX")} MXN
                        </p>
                        <p>{ring.diamond_points} puntos de diamante</p>
                        <p>
                          {ring.gold_color} {ring.gold_karat}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
