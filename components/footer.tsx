import Link from "next/link"
import { MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Brand */}
          <p className="font-serif text-sm font-semibold tracking-tight">Anillos Guillén</p>

          {/* Location & WhatsApp */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs text-muted-foreground">
            <span>Acapulco, Guerrero</span>
            <a
              href="https://wa.me/527444496769"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/75">
            &copy; {new Date().getFullYear()} Anillos Guillén. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
