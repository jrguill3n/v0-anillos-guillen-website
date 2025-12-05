import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, CreditCard } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Contacto y Ubicación - Visítanos en Acapulco",
  description:
    "Visita Anillos Guillén en Av. Costera Miguel Alemán, Acapulco. Contáctanos por WhatsApp: +52 744 123 4567. Horario: Lun-Vie 10:00-19:00, Sáb 10:00-15:00.",
  keywords: [
    "contacto Anillos Guillén",
    "joyería Acapulco ubicación",
    "Av. Costera Miguel Alemán",
    "WhatsApp joyería",
    "horario joyería Acapulco",
  ],
  alternates: {
    canonical: "/contacto",
  },
  openGraph: {
    title: "Contacto y Ubicación - Anillos Guillén Acapulco",
    description:
      "Visítanos en Av. Costera Miguel Alemán, Acapulco. Contáctanos por WhatsApp o teléfono para cotizaciones personalizadas.",
    url: "/contacto",
    type: "website",
    images: [
      {
        url: "/map-location-acapulco-mexico-street-view.jpg",
        width: 1200,
        height: 630,
        alt: "Ubicación de Anillos Guillén en Acapulco",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto y Ubicación - Anillos Guillén Acapulco",
    description:
      "Visítanos en Av. Costera Miguel Alemán, Acapulco. Contáctanos por WhatsApp o teléfono para cotizaciones personalizadas.",
    images: ["/map-location-acapulco-mexico-street-view.jpg"],
  },
}

export const dynamic = "force-static"

export default function ContactoPage() {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: "Anillos Guillén",
    description:
      "Joyería familiar especializada en anillos de compromiso con más de 20 años de experiencia en Acapulco",
    image: "https://anillosguillen.com/map-location-acapulco-mexico-street-view.jpg",
    url: "https://anillosguillen.com",
    telephone: "+52-744-123-4567",
    email: "contacto@anillosguillen.com",
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
    paymentAccepted: "Cash, Credit Card, Debit Card, Bank Transfer",
    sameAs: ["https://wa.me/5217441234567"],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />

      <Navigation />
      <main className="min-h-screen">
        <section className="py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight md:text-5xl">Contacto</h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Estamos aquí para ayudarte a encontrar el anillo perfecto. Visítanos o contáctanos por el medio que
                prefieras.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Dirección */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Dirección</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Av. Costera Miguel Alemán 123
                    <br />
                    Fracc. Costa Azul
                    <br />
                    Acapulco de Juárez, Guerrero
                    <br />
                    C.P. 39850
                  </p>
                </CardContent>
              </Card>

              {/* WhatsApp y Teléfono */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">WhatsApp y Teléfono</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      <a
                        href="https://wa.me/5217441234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-accent"
                      >
                        WhatsApp: +52 744 123 4567
                      </a>
                    </p>
                    <p>
                      <a href="tel:+527441234567" className="transition-colors hover:text-accent">
                        Tel: (744) 123 4567
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Correo */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Correo Electrónico</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:contacto@anillosguillen.com" className="transition-colors hover:text-accent">
                      contacto@anillosguillen.com
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Horario */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Horario</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Lunes a Viernes: 10:00 - 19:00</p>
                    <p>Sábados: 10:00 - 15:00</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </CardContent>
              </Card>

              {/* Formas de pago */}
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Formas de Pago</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Aceptamos efectivo, tarjetas de crédito y débito (Visa, Mastercard, American Express),
                    transferencias bancarias y planes de financiamiento. Pregunta por nuestros planes de pago a meses
                    sin intereses.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mapa placeholder */}
            <div className="mt-12">
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-secondary relative">
                    <Image
                      src="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/228000/228069-Guerrero.jpg"
                      alt="Ubicación de Anillos Guillén en Acapulco"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                      className="object-cover"
                      quality={80}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
