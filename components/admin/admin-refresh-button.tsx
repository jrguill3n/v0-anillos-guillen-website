"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"

export function AdminRefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      router.refresh()
      // Wait a bit for refresh to complete
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Actualizar la lista desde la base de datos"
      className="gap-2"
    >
      <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">Actualizar</span>
    </Button>
  )
}
