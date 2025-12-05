import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Gem, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Anillos de Compromiso en Acapulco - Joyero de Confianza",
  description:
    "Joyería familiar con más de 20 años de experiencia en Acapulco. Especialistas en anillos de compromiso con diamantes certificados. Es bueno tener en quién confiar.",
  keywords: [
    "anillos de compromiso Acapulco",
    "joyería Acapulco",
    "anillos de boda",
    "diamantes certificados",
    "joyero de confianza",
    "oro 14k",
    "oro 18k",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Anillos de Compromiso en Acapulco - Joyero de Confianza",
    description:
      "Joyería familiar especializada en anillos de compromiso con más de 20 años de experiencia en Acapulco",
    url: "/",
    type: "website",
    images: [
      {
        url: "/elegant-diamond-engagement-ring-on-silk-fabric.jpg",
        width: 1200,
        height: 630,
        alt: "Anillo de compromiso elegante con diamante - Anillos Guillén",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anillos de Compromiso en Acapulco - Joyero de Confianza",
    description:
      "Joyería familiar especializada en anillos de compromiso con más de 20 años de experiencia en Acapulco",
    images: ["/elegant-diamond-engagement-ring-on-silk-fabric.jpg"],
  },
}

export const dynamic = "force-dynamic"

export default function HomePage() {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "Anillos Guillén",
    description:
      "Joyería familiar especializada en anillos de compromiso con más de 20 años de experiencia en Acapulco",
    image: "https://anillosguillen.com/elegant-diamond-engagement-ring-on-silk-fabric.jpg",
    url: "https://anillosguillen.com",
    telephone: "+52-744-123-4567",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Costera Miguel Alemán 123, Fracc. Costa Azul",
      addressLocality: "Acapulco de Juárez",
      addressRegion: "Guerrero",
      postalCode: "39850",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 16.8531,
      longitude: -99.8237,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "15:00",
      },
    ],
    sameAs: ["https://wa.me/5217441234567"],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />

      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-gradient-to-b from-muted/50 to-background">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover opacity-40"
              poster="/elegant-luxury-diamond-engagement-ring-on-white-ma.jpg"
            >
              {/* You'll need to add your own video file to /publichttps://hebbkx1anhila5yf.public.blob.vercel-storage.com/3327617-hd_1280_720_24fps-TXX7dya2ICHRcKpvzFVGsku1pT8JOY.mp4 */}
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3327617-hd_1280_720_24fps-TXX7dya2ICHRcKpvzFVGsku1pT8JOY.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/60" />
          </div>

          <div className="container relative z-10 mx-auto max-w-7xl px-6 py-32 text-center">
            <h1 className="mb-8 font-serif text-5xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
              Es bueno tener en quién confiar
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground text-pretty leading-relaxed">
              Creamos anillos de compromiso que simbolizan tu amor y confianza. Con más de 20 años de experiencia, somos
              tu aliado en el momento más importante.
            </p>
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/catalogo">Ver catálogo de anillos</Link>
            </Button>
          </div>
        </section>

        {/* Quiénes Somos */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-8 font-serif text-4xl font-bold tracking-tight md:text-5xl">Quiénes somos</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Somos una joyería familiar con más de 20 años de trayectoria en Acapulco, Guerrero. Nos especializamos
                en anillos de compromiso, ofreciendo piezas únicas que combinan calidad excepcional con diseños
                atemporales. Cada anillo que creamos lleva consigo nuestra pasión por la joyería y el compromiso de
                ayudarte a elegir la pieza perfecta para ese momento especial.
              </p>
            </div>
          </div>
        </section>

        {/* Lo que necesitas saber */}
        <section className="border-y bg-muted/30 py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <h2 className="mb-16 text-center font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Lo que necesitas saber
            </h2>

            <div className="grid gap-10 md:grid-cols-2">
              {/* Montadura */}
              <div className="rounded-lg border bg-card p-10 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold">Montadura</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  La montadura es la estructura que sostiene el diamante. Fabricamos nuestras monturas en oro amarillo,
                  blanco o rosa de 14k o 18k, garantizando durabilidad y elegancia. Cada diseño es cuidadosamente
                  elaborado para realzar la belleza del diamante y adaptarse perfectamente a tu estilo personal.
                </p>
              </div>

              {/* Diamante */}
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

        {/* Sobre nosotros */}
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto max-w-7xl px-6">
            <h2 className="mb-16 text-center font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Sobre nosotros
            </h2>

            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex items-start gap-4 rounded-lg border bg-card p-6 shadow-sm">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-lg">
                    <strong>Estamos en Acapulco, Gro. México.</strong> Atendemos en nuestro establecimiento y enviamos a
                    toda la República Mexicana.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border bg-card p-6 shadow-sm">
                <span className="text-2xl">💍</span>
                <div>
                  <p className="text-lg">
                    <strong>Nuestros anillos son en Oro de 14K con Diamante Natural.</strong> Los puntos es el tamaño
                    del diamante.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border bg-card p-6 shadow-sm">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="text-lg">
                    <strong>Nuestras piezas incluyen:</strong> certificado de autenticidad, póliza de garantía, nota de
                    venta y caja de nogal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border bg-card p-6 shadow-sm">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-lg">
                    <strong>Nuestros productos están disponibles para entrega inmediata.</strong> Aceptamos todos los
                    medios de pago.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border bg-card p-6 shadow-sm">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-lg">
                    <strong>Atención Personalizada.</strong> Te acompañamos en cada paso para encontrar el anillo
                    perfecto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24">
          <div className="container mx-auto max-w-7xl px-6 text-center">
            <h2 className="mb-6 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              ¿Listo para encontrar el anillo perfecto?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Explora nuestra colección de anillos de compromiso y encuentra la pieza que simbolizará tu amor eterno.
            </p>
            <Button asChild size="lg">
              <Link href="/catalogo">Ver catálogo completo</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
