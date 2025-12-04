import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h1 className="mb-4 font-serif text-6xl font-bold">404</h1>
          <h2 className="mb-4 font-serif text-2xl font-semibold">Página no encontrada</h2>
          <p className="mb-8 text-muted-foreground">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  )
}
