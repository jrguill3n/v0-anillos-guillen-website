import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { formatGoldInfo } from "@/lib/utils"
import { Heart, MapPin, Users, MessageCircle, Crown, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Anillos de compromiso en Acapulco | Anillos Guillén",
  description:
    "Encuentra anillos de compromiso en oro de 14K con diamante natural. Atención personalizada por WhatsApp. Más de 30 años de experiencia en Acapulco.",
  keywords: [
    "anillos de compromiso",
    "anillos de compromiso Acapulco",
    "diamantes naturales",
    "anillos de boda",
    "oro 14K",
    "joyería Acapulco",
  ],
  alternates: {
    canonical: "https://anillosguillen.com/landing/anillos-compromiso",
  },
  openGraph: {
    title: "Anillos de Compromiso en Acapulco - Anillos Guillén",
    description: "Encuentra el anillo de compromiso perfecto con diamante natural. Atención personalizada.",
    url: "https://anillosguillen.com/landing/anillos-compromiso",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "https://anillosguillen.com/white-gold-diamond-solitaire-engagement-ring.jpg",
        width: 1200,
        height: 630,
        alt: "Anillo de compromiso elegante",
      },
    ],
  },
}

export const dynamic = "force-dynamic"

const WHATSAPP_PHONE = "527444496769"

interface Ring {
  id: string
  code: string
  name: string
  price: number
  diamond_points: number
  metal_color: string
  metal_karat: string
  image_url: string
  slug: string
}

async function getFeaturedRings(): Promise<Ring[]> {
  const correlationId = logDbConnection("LANDING_FEATURED_RINGS")

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rings")
      .select("*")
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("price", { ascending: true })
      .limit(6)

    if (error) {
      console.error(`[v0] [${correlationId}] Error fetching rings:`, error)
      return []
    }

    return (
      data?.filter((ring) => ring.slug && ring.code && ring.image_url && ring.price != null) || []
    )
  } catch (error) {
    console.error(`[v0] [${correlationId}] Exception fetching rings:`, error)
    return []
  }
}

export default async function LandingPage() {
  const rings = await getFeaturedRings()
  const whatsappMessage = encodeURIComponent("Hola, me gustaría recibir información sobre anillos de compromiso.")
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                Encuentra el anillo de compromiso{" "}
                <span className="font-semibold text-amber-900">perfecto</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Diseños en oro de 14K con diamante natural. Atención personalizada por WhatsApp.
              </p>
            </div>

            {/* Primary CTA - Very visible */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-8">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg rounded-lg shadow-lg"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Más información por WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-slate-300 text-slate-900 font-semibold text-lg rounded-lg hover:bg-slate-50"
              >
                <Link href="/catalogo">Ver catálogo completo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust / Social Proof Section */}
        <section className="bg-white py-12 sm:py-16 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
              {/* Experience */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-full">
                  <Crown className="w-7 h-7 text-amber-900" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Más de 30 años</h3>
                <p className="text-slate-600 text-sm">De experiencia en joyería de compromiso</p>
              </div>

              {/* Personal Attention */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-full">
                  <Heart className="w-7 h-7 text-amber-900" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Atención personalizada</h3>
                <p className="text-slate-600 text-sm">Asesoría experta por WhatsApp</p>
              </div>

              {/* Location */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-full">
                  <MapPin className="w-7 h-7 text-amber-900" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Ubicados en Acapulco</h3>
                <p className="text-slate-600 text-sm">Joyería de confianza local</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Rings Section */}
        {rings.length > 0 && (
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center space-y-4 mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight">Anillos destacados</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Selección de nuestros anillos más populares. Cada pieza es única y elaborada con los más altos
                  estándares de calidad.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
                {rings.map((ring) => (
                  <Link key={ring.id} href={`/catalogo/${ring.slug}`} className="group">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="aspect-square overflow-hidden rounded-lg bg-slate-100 relative shadow-sm group-hover:shadow-md transition-shadow">
                        <Image
                          src={ring.image_url || "/placeholder.svg"}
                          alt={ring.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wide">
                          {ring.code}
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-slate-900">
                          ${(ring.price || 0).toLocaleString("es-MX")} MXN
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {ring.diamond_points} pts • {formatGoldInfo(ring.metal_color, ring.metal_karat)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CTA for featured rings */}
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Consultar sobre anillo
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us Section */}
        <section className="bg-slate-50 py-16 sm:py-24 border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-center mb-12 sm:mb-16">
              ¿Por qué elegirnos?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
              {[
                {
                  icon: Users,
                  title: "Atención personalizada previa cita",
                  description: "Te asesoramos en cada paso para encontrar el anillo perfecto para ti.",
                },
                {
                  icon: Sparkles,
                  title: "Diamante natural certificado",
                  description: "Todos nuestros diamantes son naturales y certificados con garantía.",
                },
                {
                  icon: Crown,
                  title: "Diseños clásicos y modernos",
                  description: "Desde elegantes solitarios hasta diseños contemporáneos personalizados.",
                },
                {
                  icon: MessageCircle,
                  title: "Asesoría directa por WhatsApp",
                  description: "Resuelve tus dudas sin compromiso. Estamos disponibles para ayudarte.",
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 pt-1">
                      <Icon className="w-6 h-6 text-amber-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Strong CTA Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-16 sm:py-24 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">¿Buscas el anillo ideal?</h2>
            <p className="text-lg text-emerald-50">
              Nuestro equipo está listo para ayudarte a encontrar exactamente lo que estás buscando.
            </p>
            <Button
              asChild
              size="lg"
              className="h-14 px-10 bg-white text-emerald-700 hover:bg-slate-50 font-semibold text-lg rounded-lg shadow-lg"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Hablar por WhatsApp
              </a>
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-center mb-12 sm:mb-16">
              Preguntas frecuentes
            </h2>

            <div className="space-y-8">
              {[
                {
                  q: "¿Manejan citas?",
                  a: "Sí, contáctanos por WhatsApp para agendar una cita personalizada en nuestra joyería en Acapulco.",
                },
                {
                  q: "¿Dónde están ubicados?",
                  a: "Nos encontramos en Acapulco, Guerrero. Te enviaremos nuestra dirección exacta cuando agendes tu cita.",
                },
                {
                  q: "¿Qué tipo de oro utilizan?",
                  a: "Utilizamos oro de 14K de la más alta calidad, en amarillo, blanco y rosa. Todos nuestros anillos cuentan con certificado de autenticidad.",
                },
                {
                  q: "¿Puedo pedir información por WhatsApp?",
                  a: "¡Claro! Es nuestra forma principal de comunicación. Te atenderemos rápidamente con asesoría personalizada.",
                },
              ].map((item, idx) => (
                <div key={idx} className="border-b border-slate-200 pb-6 last:border-b-0">
                  <h3 className="font-semibold text-slate-900 mb-3">{item.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-50 py-16 sm:py-20 border-t border-slate-100">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-light mb-6">Comienza tu búsqueda hoy</h2>
            <Button
              asChild
              size="lg"
              className="h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Contactar por WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky WhatsApp Button on Mobile */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <div className="w-16 h-16 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center shadow-lg transition-all">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </a>
      </div>

      <Footer />
    </>
  )
}
