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
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Actualizar la lista desde la base de datos"
      className="gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 font-medium"
    >
      <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span>Actualizar</span>
    </Button>
  )
}
