import Link from "next/link"

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-tight transition-colors hover:text-primary"
        >
          Anillos Guillén
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/catalogo" className="transition-colors hover:text-primary">
            Catálogo
          </Link>
          <Link href="/contacto" className="transition-colors hover:text-primary">
            Contacto
          </Link>
        </div>
      </nav>
    </header>
  )
}
