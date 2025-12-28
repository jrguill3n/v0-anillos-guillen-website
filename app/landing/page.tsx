import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Shield, Truck, Heart, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Anillos de Compromiso Hechos a Tu Medida | Anillos Guillén",
  description:
    "Más de 35 años creando anillos únicos con asesoría personalizada. Diseños personalizados, envío a todo México. Cotiza por WhatsApp.",
  keywords: [
    "anillos de compromiso",
    "anillos personalizados",
    "joyería Acapulco",
    "diamantes certificados",
    "oro 14k",
    "envío a todo México",
  ],
  robots: "noindex, nofollow", // Landing page for ads only
}

export const revalidate = 0
export const dynamic = "force-dynamic"

const WhatsAppButton = ({ text = "Cotiza por WhatsApp", mobile = false }: { text?: string; mobile?: boolean }) => {
  const whatsappNumber = "527444496769"
  const message = encodeURIComponent("Hola, me interesa información sobre sus anillos de compromiso.")
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <Button asChild size={mobile ? "default" : "lg"} className={mobile ? "w-full" : "shadow-lg text-lg px-8 py-6"}>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        {text}
      </a>
    </Button>
  )
}

const StickyWhatsAppButton = () => {
  const whatsappNumber = "527444496769"
  const message = encodeURIComponent("Hola, me interesa información sobre sus anillos de compromiso.")
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 transition-transform duration-200"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  )
}

export default async function LandingPage() {
  let rings = []
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("rings")
      .select("id, slug, code, image_url, price, diamond_points, metal_color, metal_karat")
      .order("price", { ascending: true })
      .limit(8)

    if (!error && data) {
      rings = data
    }
  } catch (e) {
    console.error("[v0] Landing page: Failed to fetch rings", e)
  }

  return (
    <>
      <StickyWhatsAppButton />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-b from-muted/30 to-background">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover opacity-30"
              poster="/elegant-luxury-diamond-engagement-ring-on-white-ma.jpg"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3327617-hd_1280_720_24fps-TXX7dya2ICHRcKpvzFVGsku1pT8JOY.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/70" />
          </div>

          <div className="container relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
            <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
              Anillos de compromiso hechos a tu medida
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed">
              Explora nuestros diseños y encuentra el anillo perfecto para tu historia
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button asChild size="lg" className="shadow-lg text-lg px-8 py-6">
                <a href="#catalog" className="flex items-center gap-2">
                  Ver diseños
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">Atención directa y envío a todo México</p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-lg">Más de 35 años de experiencia</h3>
                <p className="text-sm text-muted-foreground">Joyería familiar de confianza</p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-lg">Diseños personalizados</h3>
                <p className="text-sm text-muted-foreground">Creamos el anillo perfecto para ti</p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-lg">Envíos seguros a todo México</h3>
                <p className="text-sm text-muted-foreground">Entrega garantizada</p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="mb-2 font-semibold text-lg">Atención directa con el joyero</h3>
                <p className="text-sm text-muted-foreground">Asesoría personalizada</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section id="catalog" className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="mb-4 text-center font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Algunos de nuestros diseños
            </h2>
            <p className="mb-12 text-center text-muted-foreground">
              Cada anillo es único y está elaborado con los más altos estándares de calidad
            </p>

            {rings.length > 0 ? (
              <>
                <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-12">
                  {rings.map((ring) => (
                    <Link key={ring.id} href={`/catalogo/${ring.slug}`}>
                      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 p-0 py-0">
                        <div className="aspect-square overflow-hidden bg-secondary relative">
                          <Image
                            src={ring.image_url || "/placeholder.svg?height=600&width=600"}
                            alt={ring.code || "Anillo de compromiso"}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-0">
                          <div className="p-3 md:p-4">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">{ring.code}</p>
                            <p className="text-sm md:text-base font-semibold text-primary">
                              ${(ring.price || 0).toLocaleString("es-MX")} MXN
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="text-center">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/catalogo">Ver catálogo completo</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6 text-lg">
                  Descubre nuestra colección completa de anillos de compromiso
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/catalogo">Ver catálogo completo</Link>
                  </Button>
                  <WhatsAppButton text="Consultar por WhatsApp" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Transition Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-4 font-serif text-3xl md:text-4xl font-bold tracking-tight">¿Te gustó algún diseño?</h2>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              Podemos ayudarte a elegir el anillo ideal según tu estilo y presupuesto.
            </p>
            <WhatsAppButton text="Hablar con un asesor" />
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-6">
            <h2 className="mb-12 text-center font-serif text-3xl md:text-4xl font-bold tracking-tight">
              ¿Cómo funciona?
            </h2>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-xl">Escríbenos por WhatsApp</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Contáctanos directamente y cuéntanos qué estás buscando
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-xl">Te asesoramos según tu estilo y presupuesto</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Te ayudamos a elegir el diseño, diamante y oro perfectos para ti
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-xl">Diseñamos y fabricamos tu anillo</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Creamos tu anillo con la más alta calidad y atención al detalle
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-xl">Envío seguro a tu domicilio</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Recibe tu anillo en cualquier parte de México con garantía y certificado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-5xl px-6">
            <h2 className="mb-12 text-center font-serif text-3xl md:text-4xl font-bold tracking-tight">
              Lo que dicen nuestros clientes
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    "Excelente atención y calidad. Todo el proceso fue muy claro y el anillo quedó hermoso. Lo
                    recomiendo 100%."
                  </p>
                  <p className="font-semibold text-sm">- María G.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    "Me ayudaron a elegir el anillo perfecto dentro de mi presupuesto. La atención es muy personalizada
                    y profesional."
                  </p>
                  <p className="font-semibold text-sm">- Carlos R.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    "Más de 35 años de experiencia se nota en cada detalle. El anillo es precioso y llegó muy bien
                    empacado."
                  </p>
                  <p className="font-semibold text-sm">- Laura M.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 bg-primary/5">
          <div className="container mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-6 font-serif text-3xl md:text-5xl font-bold tracking-tight">
              ¿Listo para elegir el anillo ideal?
            </h2>
            <p className="mb-10 text-lg text-muted-foreground leading-relaxed">
              Contáctanos por WhatsApp y te ayudamos a encontrar el anillo perfecto
            </p>
            <WhatsAppButton text="Hablar por WhatsApp" />

            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">Más de 35 años creando momentos inolvidables</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span>✓ Oro 14K con diamante natural</span>
                <span>✓ Certificado de autenticidad</span>
                <span>✓ Envío a todo México</span>
                <span>✓ Atención personalizada</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
