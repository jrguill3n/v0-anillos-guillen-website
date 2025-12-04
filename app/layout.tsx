import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://anillosguillen.com"),
  title: {
    template: "%s | Anillos Guillén",
    default: "Anillos Guillén - Anillos de Compromiso en Acapulco",
  },
  description:
    "Anillos de compromiso y joyería fina en Acapulco. Diseños elegantes, diamantes certificados y atención personalizada. Más de 20 años de experiencia.",
  keywords: [
    "anillos de compromiso",
    "anillos de compromiso Acapulco",
    "joyería Acapulco",
    "diamantes certificados",
    "oro 14k",
    "oro 18k",
    "joyero de confianza",
    "anillos de boda",
    "compromiso",
  ],
  authors: [{ name: "Anillos Guillén" }],
  creator: "Anillos Guillén",
  publisher: "Anillos Guillén",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Anillos Guillén",
    title: "Anillos Guillén - Anillos de Compromiso en Acapulco",
    description:
      "Anillos de compromiso y joyería fina en Acapulco. Diseños elegantes, diamantes certificados y atención personalizada.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anillos Guillén - Anillos de Compromiso en Acapulco",
    description:
      "Anillos de compromiso y joyería fina en Acapulco. Diseños elegantes, diamantes certificados y atención personalizada.",
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX">
      <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
