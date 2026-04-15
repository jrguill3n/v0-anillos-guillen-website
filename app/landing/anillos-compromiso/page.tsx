import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { formatGoldInfo, formatDiamondInfo } from "@/lib/utils"
import { Heart, MapPin, MessageCircle, Shield, Gem, Check } from "lucide-react"

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
    return data?.filter((ring) => ring.slug && ring.code && ring.image_url && ring.price != null) || []
  } catch (error) {
    console.error(`[v0] [${correlationId}] Exception fetching rings:`, error)
    return []
  }
}

export default async function LandingPage() {
  const rings = await getFeaturedRings()
  const whatsappMessage = encodeURIComponent("Hola, quiero información sobre anillos de compromiso")
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`

  return (
    <>
      <Navigation />
      <main>

        {/* ================================================
            1) HERO — hook + primary CTA above the fold
            ================================================ */}
        <section className="flex min-h-[88vh] items-center justify-center bg-gradient-to-b from-muted/60 to-background px-5 py-14 md:py-24">
          <div className="mx-auto w-full max-w-3xl space-y-7 text-center">

            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Joyería Guillén · Acapulco
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Encuentra el anillo de compromiso{" "}
              <span className="text-primary">perfecto</span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Diseños en oro de 14K con diamante natural certificado. Te asesoramos de forma personalizada, sin compromiso.
            </p>

            {/* Primary CTA stack — full width on mobile, inline on desktop */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] sm:w-auto"
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                Más información por WhatsApp
              </a>
              <Link
                href="/catalogo"
                className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-7 py-4 text-base font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97] sm:w-auto"
              >
                Ver catálogo
              </Link>
            </div>

            <p className="text-sm italic text-muted-foreground">
              Te ayudamos a elegir según tu estilo y presupuesto.
            </p>
          </div>
        </section>

        {/* ================================================
            2) TRUST STRIP — quick credibility validation
            ================================================ */}
        <section className="border-y bg-muted/40 px-5 py-8 md:py-10">
          <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { icon: Shield,      label: "30+ años de experiencia" },
              { icon: Heart,       label: "Atención personalizada" },
              { icon: MapPin,      label: "Ubicados en Acapulco" },
              { icon: Check,       label: "Citas previas disponibles" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================
            3) FEATURED RINGS — low-friction browse
            ================================================ */}
        {rings.length > 0 && (
          <section className="px-5 py-14 md:py-24">
            <div className="mx-auto w-full max-w-6xl">

              <div className="mb-10 text-center md:mb-14">
                <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
                  Anillos destacados
                </h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  Selección en oro de 14K con diamante natural certificado.
                </p>
              </div>

              {/* 1 col → 2 col → 3 col grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rings.slice(0, 6).map((ring) => (
                  <div
                    key={ring.id}
                    className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    {/* Ring image */}
                    <Link href={`/catalogo/${ring.slug}`} className="block overflow-hidden">
                      <div className="relative aspect-square bg-muted">
                        <Image
                          src={ring.image_url || "/placeholder.svg"}
                          alt={ring.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </Link>

                    {/* Card body */}
                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {ring.code}
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          ${(ring.price || 0).toLocaleString("es-MX")}{" "}
                          <span className="text-sm font-normal text-muted-foreground">MXN</span>
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatDiamondInfo(ring.main_diamond_points || ring.diamond_points, ring.side_diamond_points)} · {formatGoldInfo(ring.metal_color)}
                        </p>
                      </div>

                      {/* Per-ring WhatsApp CTA — full width */}
                      <a
                        href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hola, me interesa el anillo ${ring.code}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.97]"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        Más información
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Catalog link */}
              <div className="mt-10 text-center">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-card px-7 py-3 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97]"
                >
                  Ver catálogo completo
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ================================================
            4) GUIDED HELP — key conversion driver
            ================================================ */}
        <section className="border-t bg-muted/40 px-5 py-14 md:py-24">
          <div className="mx-auto w-full max-w-3xl">

            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
                Te ayudamos a elegir el anillo ideal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Sabemos que esta decisión es importante. Te guiamos paso a paso sin ningún compromiso.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-10">
              <ul className="space-y-5">
                {[
                  { icon: "💰", text: "Elegimos opciones según tu presupuesto" },
                  { icon: "💎", text: "Te explicamos todo sobre diamantes de forma simple" },
                  { icon: "👀", text: "Te mostramos opciones reales y disponibles" },
                  { icon: "⚡", text: "Atención directa con respuesta rápida por WhatsApp" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-4">
                    <span className="text-2xl shrink-0 sm:text-3xl" aria-hidden="true">{item.icon}</span>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA — full width on mobile */}
            <div className="mt-8 flex justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] sm:w-auto"
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ================================================
            5) EDUCATION — reuse homepage card style
            ================================================ */}
        <section className="px-5 py-14 md:py-24">
          <div className="mx-auto w-full max-w-5xl">
            <h2 className="mb-10 text-center font-serif text-3xl font-bold tracking-tight md:mb-14 md:text-4xl">
              Lo que necesitas saber
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "Montadura",
                  body: "La montadura es la estructura que sostiene el diamante. Fabricamos nuestras monturas en oro amarillo, blanco o rosa de 14K, garantizando durabilidad y elegancia. Cada diseño realza la belleza del diamante y se adapta a tu estilo personal.",
                },
                {
                  icon: Gem,
                  title: "Diamante",
                  body: "Los diamantes se evalúan por las 4 C's: Corte, Color, Claridad y Quilates (puntos). Trabajamos con diamantes certificados de calidad excepcional. Te asesoramos para que elijas el diamante ideal según tu presupuesto.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-lg border bg-card p-7 shadow-sm sm:p-10">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-14 sm:w-14">
                      <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold sm:text-2xl">{title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================
            6) STRONG CTA BLOCK — high-impact midpage push
            ================================================ */}
        <section className="border-y bg-muted/40 px-5 py-14 md:py-24">
          <div className="mx-auto w-full max-w-2xl space-y-6 text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
              ¿Listo para encontrar el anillo perfecto?
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Escríbenos por WhatsApp y te ayudamos personalmente, sin compromiso ni presión.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] sm:w-auto"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              Más información por WhatsApp
            </a>
          </div>
        </section>

        {/* ================================================
            7) FAQ — remove purchase objections
            ================================================ */}
        <section className="px-5 py-14 md:py-24">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="mb-10 text-center font-serif text-3xl font-bold tracking-tight md:mb-14 md:text-4xl">
              Preguntas frecuentes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  q: "¿Necesito cita?",
                  a: "Contáctanos por WhatsApp para agendar una cita personalizada. Estamos disponibles de lunes a sábado.",
                },
                {
                  q: "¿Dónde están ubicados?",
                  a: "Nos encontramos en Acapulco, Guerrero. Te enviamos la dirección exacta al agendar tu cita.",
                },
                {
                  q: "¿Qué tipo de oro manejan?",
                  a: "Oro de 14K en amarillo, blanco y rosa. Todos los anillos incluyen certificado de autenticidad.",
                },
                {
                  q: "¿Puedo preguntar por WhatsApp?",
                  a: "¡Claro! Es nuestra forma principal de contacto. Respondemos con asesoría personalizada sin compromiso.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="rounded-lg border bg-card p-6 shadow-sm transition-shadow duration-150 hover:shadow-md"
                >
                  <h3 className="mb-2 font-semibold text-foreground">{item.q}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================
            8) FINAL CTA — closing push
            ================================================ */}
        <section className="border-t bg-muted/40 px-5 py-14 md:py-20">
          <div className="mx-auto w-full max-w-xl space-y-5 text-center">
            <h2 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
              Comienza tu búsqueda hoy
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Nuestro equipo está listo para guiarte hacia el anillo perfecto.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-lg active:scale-[0.97] sm:w-auto"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              Contactar por WhatsApp
            </a>
          </div>
        </section>

      </main>

      {/* ================================================
          STICKY FLOATING WHATSAPP — mobile only
          ================================================ */}
      <div className="fixed bottom-5 right-5 z-50 md:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-150 hover:shadow-xl active:scale-95"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </a>
      </div>

      <Footer />
    </>
  )
}
