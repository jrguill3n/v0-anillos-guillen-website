import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Anillos Guillén</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Joyería familiar especializada en anillos de compromiso desde hace más de 35 años en Acapulco.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-muted-foreground transition-colors hover:text-foreground">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Acapulco, Guerrero</li>
              <li>ventas@anillosguillen.com</li>
              <li>
                <a
                  href="https://wa.me/527444496769"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  WhatsApp: +52 74 44 49 67 69
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/anillos.guillen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Anillos Guillén. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
