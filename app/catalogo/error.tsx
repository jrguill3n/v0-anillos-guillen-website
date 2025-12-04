"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Catalog error:", error)
  }, [error])

  return (
    <>
      <Navigation />
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
          <p className="text-muted-foreground mb-6">No pudimos cargar el catálogo. Por favor intenta de nuevo.</p>
          <Button onClick={reset}>Intentar de nuevo</Button>
        </div>
      </main>
      <Footer />
    </>
  )
}
