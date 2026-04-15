import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { formatGoldInfo } from "@/lib/utils"
import { Heart, MapPin, Users, MessageCircle, Shield, Gem, Check } from "lucide-react"

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
  const whatsappMessage = encodeURIComponent("Hola, quiero información sobre anillos de compromiso")
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`

  return (
    <>
      <Navigation />
      <main>
        {/* ============================================
            1) HERO SECTION - HOOK + CTA (NO SCROLL)
            ============================================ */}
        <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-muted/50 to-background py-16 md:py-20">
          <div className="container mx-auto max-w-4xl px-6 text-center space-y-8">
            {/* Headline */}
            <h1 className="font-serif text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
              Encuentra el anillo de compromiso{" "}
              <span className="font-semibold">perfecto</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              Diseños en oro de 14K con diamante natural. Te asesoramos por WhatsApp de forma personalizada.
            </p>

            {/* Emotional Support Line */}
            <p className="text-base text-muted-foreground italic">
              Te ayudamos a elegir el anillo ideal según tu estilo y presupuesto.
            </p>

            {/* Primary CTA - VERY PROMINENT */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-semibold shadow-lg"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Más información por WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-semibold"
              >
                <Link href="/catalogo" className="flex items-center justify-center gap-2">
                  Ver catálogo
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================
            2) TRUST STRIP - FAST VALIDATION
            ============================================ */}
        <section className="border-y bg-muted/30 py-8 md:py-10">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {/* Trust Item 1 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  30+ años de experiencia
                </p>
              </div>

              {/* Trust Item 2 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Atención personalizada
                </p>
              </div>

              {/* Trust Item 3 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Ubicados en Acapulco
                </p>
              </div>

              {/* Trust Item 4 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">
                  Citas previas disponibles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            3) FEATURED RINGS - LOW FRICTION BROWSE
            ============================================ */}
        {rings.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Anillos destacados
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explora nuestras opciones más populares en oro de 14K con diamante natural certificado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {rings.slice(0, 6).map((ring) => (
                  <div key={ring.id} className="rounded-lg border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <Link href={`/catalogo/${ring.slug}`} className="block aspect-square overflow-hidden bg-muted">
                      <Image
                        src={ring.image_url || "/placeholder.svg"}
                        alt={ring.name}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                          {ring.code}
                        </p>
                        <p className="text-lg font-semibold">
                          ${(ring.price || 0).toLocaleString("es-MX")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ring.diamond_points} pts • {formatGoldInfo(ring.metal_color, ring.metal_karat)}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="w-full"
                      >
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Más información
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Catalog Link */}
              <div className="text-center">
                <Button asChild variant="outline" size="lg">
                  <Link href="/catalogo">Ver catálogo completo</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================
            4) GUIDED HELP SECTION - KEY CONVERSION DRIVER
            ============================================ */}
        <section className="border-t bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl px-6">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Te ayudamos a elegir el anillo ideal
              </h2>
              <p className="text-muted-foreground text-lg">
                Sabemos que elegir un anillo de compromiso es importante. Te asesoramos paso a paso por WhatsApp.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-10 shadow-sm space-y-6 mb-10">
              {[
                { icon: "💰", text: "Elegimos según tu presupuesto" },
                { icon: "💎", text: "Te explicamos diamantes de forma simple" },
                { icon: "👀", text: "Te mostramos opciones reales y disponibles" },
                { icon: "⚡", text: "Atención directa y respuesta rápida" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <p className="text-lg text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            {/* CTA Below */}
            <div className="text-center">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-semibold"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Hablar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================
            5) EDUCATION - REUSE EXISTING STYLE
            ============================================ */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <h2 className="text-center font-serif text-3xl md:text-4xl font-bold tracking-tight mb-12 md:mb-16">
              Lo que necesitas saber
            </h2>

            <div className="grid gap-10 md:grid-cols-2">
              {/* Montadura Card */}
              <div className="rounded-lg border bg-card p-10 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold">Montadura</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  La montadura es la estructura que sostiene el diamante. Fabricamos nuestras monturas en oro amarillo,
                  blanco o rosa de 14K, garantizando durabilidad y elegancia. Cada diseño es cuidadosamente
                  elaborado para realzar la belleza del diamante y adaptarse perfectamente a tu estilo personal.
                </p>
              </div>

              {/* Diamante Card */}
              <div className="rounded-lg border bg-card p-10 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Gem className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold">Diamante</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Los diamantes se evalúan por las 4 C's: Corte, Color, Claridad y Quilates (puntos). Trabajamos con
                  diamantes certificados que garantizan calidad excepcional. Los puntos indican el peso del diamante
                  (100 puntos = 1 quilate). Te asesoramos personalmente para que elijas el diamante ideal según tu
                  presupuesto y preferencias.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            6) STRONG CTA BLOCK - HIGH IMPACT
            ============================================ */}
        <section className="border-t border-b bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-6 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
                ¿Listo para encontrar el anillo perfecto?
              </h2>
              <p className="text-lg text-muted-foreground">
                Escríbenos por WhatsApp y te ayudamos personalmente a encontrar exactamente lo que buscas.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Más información por WhatsApp
              </a>
            </Button>
          </div>
        </section>

        {/* ============================================
            7) FAQ - REMOVE OBJECTIONS
            ============================================ */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-6">
            <h2 className="text-center font-serif text-3xl md:text-4xl font-bold tracking-tight mb-12 md:mb-16">
              Preguntas frecuentes
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  q: "¿Necesito cita?",
                  a: "Contáctanos por WhatsApp para agendar una cita personalizada. Estamos disponibles de lunes a sábado.",
                },
                {
                  q: "¿Dónde están ubicados?",
                  a: "Nos encontramos en Acapulco, Guerrero. Te enviaremos nuestra dirección exacta cuando agendes.",
                },
                {
                  q: "¿Qué tipo de oro manejan?",
                  a: "Utilizamos oro de 14K de la más alta calidad en amarillo, blanco y rosa con certificado de autenticidad.",
                },
                {
                  q: "¿Puedo pedir información por WhatsApp?",
                  a: "¡Claro! Es nuestra forma principal de comunicación. Te atenderemos rápidamente con asesoría personalizada.",
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-card p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3">{item.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            8) FINAL CTA
            ============================================ */}
        <section className="py-16 md:py-20 bg-muted/30 border-t">
          <div className="container mx-auto max-w-2xl px-6 text-center space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              Comienza tu búsqueda hoy
            </h2>
            <p className="text-muted-foreground">
              Nuestro equipo está listo para guiarte a encontrar el anillo perfecto.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* ============================================
          8) STICKY WHATSAPP CTA - MOBILE ONLY
          ============================================ */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl transition-shadow">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
        </a>
      </div>

      <Footer />
    </>
  )
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
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background">
          <div className="container relative z-10 mx-auto max-w-7xl px-6 py-32 text-center">
            <h1 className="mb-8 font-serif text-5xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
              Encuentra el anillo de compromiso{" "}
              <span className="font-semibold">perfecto</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground text-pretty leading-relaxed">
              Diseños en oro de 14K con diamante natural certificado. Atención personalizada por WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Más información por WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/catalogo">Ver catálogo completo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust / Social Proof Section */}
        <section className="border-y bg-muted/30 py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid gap-10 md:grid-cols-3">
              {/* Experience */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Más de 30 años</h3>
                <p className="text-muted-foreground">De experiencia en joyería de compromiso</p>
              </div>

              {/* Personal Attention */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Atención personalizada</h3>
                <p className="text-muted-foreground">Asesoría experta por WhatsApp</p>
              </div>

              {/* Location */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ubicados en Acapulco</h3>
                <p className="text-muted-foreground">Joyería de confianza local</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Rings Section */}
        {rings.length > 0 && (
          <section className="py-24">
            <div className="container mx-auto max-w-7xl px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="mb-8 font-serif text-4xl font-bold tracking-tight md:text-5xl">
                  Anillos destacados
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Selección de nuestros anillos más populares. Cada pieza es única y elaborada con los más altos
                  estándares de calidad.
                </p>
              </div>

              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {rings.map((ring) => (
                  <Link key={ring.id} href={`/catalogo/${ring.slug}`} className="group">
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        <Image
                          src={ring.image_url || "/placeholder.svg"}
                          alt={ring.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6 space-y-3">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          {ring.code}
                        </p>
                        <p className="text-lg font-semibold">
                          ${(ring.price || 0).toLocaleString("es-MX")} MXN
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ring.diamond_points} pts • {formatGoldInfo(ring.metal_color, ring.metal_karat)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CTA for featured rings */}
              <div className="text-center">
                <Button asChild size="lg">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Consultar sobre anillo
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us - Using same card style as homepage */}
        <section className="border-y bg-muted/30 py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <h2 className="mb-16 text-center font-serif text-4xl font-bold tracking-tight md:text-5xl">
              ¿Por qué elegirnos?
            </h2>

            <div className="grid gap-10 md:grid-cols-2">
              {[
                {
                  icon: Users,
                  title: "Atención personalizada",
                  description:
                    "Te asesoramos en cada paso para encontrar el anillo perfecto. Contáctanos por WhatsApp o agenda una cita en nuestra joyería.",
                },
                {
                  icon: Gem,
                  title: "Diamante natural certificado",
                  description:
                    "Todos nuestros diamantes son naturales y certificados. Garantizamos calidad excepcional en cada pieza.",
                },
                {
                  icon: Shield,
                  title: "Designs clásicos y modernos",
                  description:
                    "Desde elegantes solitarios hasta diseños contemporáneos personalizados. Encontrarás exactamente lo que buscas.",
                },
                {
                  icon: MessageCircle,
                  title: "Asesoría directa por WhatsApp",
                  description:
                    "Resuelve tus dudas sin compromiso. Estamos disponibles para ayudarte con toda la información que necesites.",
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="rounded-lg border bg-card p-10 shadow-sm">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-serif text-2xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Strong CTA Section */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6 text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              ¿Buscas el anillo ideal?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Nuestro equipo está listo para ayudarte a encontrar exactamente lo que estás buscando.
            </p>
            <Button asChild size="lg" className="shadow-lg">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Hablar por WhatsApp
              </a>
            </Button>
          </div>
        </section>

        {/* FAQ Section - Using card style from homepage */}
        <section className="border-y bg-muted/30 py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <h2 className="mb-16 text-center font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Preguntas frecuentes
            </h2>

            <div className="grid gap-10 md:grid-cols-2">
              {[
                {
                  q: "¿Manejan citas?",
                  a: "Sí, contáctanos por WhatsApp para agendar una cita personalizada en nuestra joyería en Acapulco. Estamos disponibles de lunes a sábado.",
                },
                {
                  q: "¿Dónde están ubicados?",
                  a: "Nos encontramos en Acapulco, Guerrero. Te enviaremos nuestra dirección exacta cuando agendes tu cita por WhatsApp.",
                },
                {
                  q: "¿Qué tipo de oro utilizan?",
                  a: "Utilizamos oro de 14K de la más alta calidad, en amarillo, blanco y rosa. Todos nuestros anillos cuentan con certificado de autenticidad.",
                },
                {
                  q: "¿Puedo pedir información por WhatsApp?",
                  a: "¡Claro! Es nuestra forma principal de comunicación. Te atenderemos rápidamente con asesoría personalizada sin compromiso.",
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-card p-10 shadow-sm">
                  <h3 className="font-serif text-2xl font-semibold mb-6">{item.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6 text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Comienza tu búsqueda hoy
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Encuentra el anillo de compromiso perfecto con la asesoría experta de nuestro equipo.
            </p>
            <Button asChild size="lg" className="shadow-lg">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contactar por WhatsApp
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky WhatsApp Button on Mobile */}
      <div className="fixed bottom-6 right-6 z-50 hidden max-sm:block">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl transition-shadow">
            <MessageCircle className="h-7 w-7 text-primary-foreground" />
          </div>
        </a>
      </div>

      <Footer />
    </>
  )
}

