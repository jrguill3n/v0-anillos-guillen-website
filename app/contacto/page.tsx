import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Mail, Clock, CreditCard, MessageCircle } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Contacto y Ubicación - Visítanos en Acapulco",
  description:
    "Visita Anillos Guillén en Fernando de Magallanes No. 17-A int. 3, Acapulco. Contáctanos por WhatsApp: +52 74 44 49 67 69. Previa Cita.",
  keywords: [
    "contacto Anillos Guillén",
    "joyería Acapulco ubicación",
    "Fernando de Magallanes",
    "WhatsApp joyería",
    "horario joyería Acapulco",
  ],
  alternates: {
    canonical: "/contacto",
  },
  openGraph: {
    title: "Contacto y Ubicación - Anillos Guillén Acapulco",
    description:
      "Visítanos en Fernando de Magallanes No. 17-A int. 3, Acapulco. Contáctanos por WhatsApp para cotizaciones personalizadas.",
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
      "Visítanos en Fernando de Magallanes No. 17-A int. 3, Acapulco. Contáctanos por WhatsApp para cotizaciones personalizadas.",
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
      "Joyería familiar especializada en anillos de compromiso con más de 35 años de experiencia en Acapulco",
    image: "https://anillosguillen.com/map-location-acapulco-mexico-street-view.jpg",
    url: "https://anillosguillen.com",
    telephone: "+52-74-44-49-67-69",
    email: "ventas@anillosguillen.com",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Fernando de Magallanes No. 17-A int. 3 Fracc. Costa Azul",
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
    sameAs: ["https://wa.me/527444496769", "https://www.facebook.com/anillos.guillen"],
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Dirección</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fernando de Magallanes No. 17-A int. 3
                    <br />
                    Fracc. Costa Azul
                    <br />
                    Acapulco de Juárez, Guerrero
                    <br />
                    C.P. 39850
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Contacto</h3>
                  <div className="space-y-2 text-muted-foreground leading-relaxed">
                    <p>
                      WhatsApp:{" "}
                      <a
                        href="https://wa.me/527444496769?text=Hola,%20me%20gustaría%20recibir%20información%20sobre%20anillos%20de%20compromiso."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline transition-opacity hover:opacity-70"
                      >
                        +52 74 44 49 67 69
                      </a>
                    </p>
                    <p>
                      Teléfono:{" "}
                      <a href="tel:7444480317" className="text-primary underline transition-opacity hover:opacity-70">
                        74 44 48 03 17
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Correo */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Correo Electrónico</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:ventas@anillosguillen.com" className="transition-colors hover:text-primary">
                      ventas@anillosguillen.com
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Horario */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Horario</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">Previa Cita</p>
                    <p>Lunes a Viernes: 10:00 - 19:00</p>
                    <p>Sábados: 10:00 - 15:00</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </CardContent>
              </Card>

              {/* Formas de pago */}
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-semibold">Formas de Pago</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Aceptamos transferencias, depósitos bancarios y pagos con Tarjeta de crédito a 6 meses sin
                    intereses.
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
