"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Ring detail error:", error)
  }, [error])

  return (
    <>
      <Navigation />
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Anillo no disponible</h2>
          <p className="text-muted-foreground mb-6">
            No pudimos cargar los detalles de este anillo. Por favor intenta de nuevo o explora nuestro catálogo.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={reset} variant="outline">
              Intentar de nuevo
            </Button>
            <Button asChild>
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
