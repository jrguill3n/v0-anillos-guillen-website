"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { deleteRing, toggleRingActive } from "@/app/admin/actions"
import { RingFormDialog } from "./ring-form-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type Ring = {
  id: string
  code: string
  name: string
  description: string
  price: number
  metal_type: string
  metal_karat: string
  metal_color: string
  diamond_points: number
  image_url: string
  slug: string
  featured: boolean
  is_active: boolean
  order_index: number
}

type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc"

export function AdminRingsListServer({ rings: initialRings }: { rings: Ring[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("price_asc")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ringToDelete, setRingToDelete] = useState<Ring | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Derive filtered/sorted list ONLY from initialRings prop (no mirrored state)
  const filteredAndSortedRings = (() => {
    let filtered = initialRings

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (ring) =>
          ring.code.toLowerCase().includes(query) ||
          ring.name.toLowerCase().includes(query) ||
          ring.slug.toLowerCase().includes(query) ||
          ring.description?.toLowerCase().includes(query),
      )
    }

    const sorted = [...filtered]
    switch (sortOption) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
    }
    
    return sorted
  })()

  async function handleToggleActive(ring: Ring) {
    setTogglingId(ring.id)
    const result = await toggleRingActive(ring.id, ring.is_active)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: ring.is_active ? "Anillo desactivado" : "Anillo activado",
      })
      // Force server refresh to get new data
      router.refresh()
    }
    setTogglingId(null)
  }

  function openDeleteDialog(ring: Ring) {
    setRingToDelete(ring)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!ringToDelete) return

    setDeletingId(ringToDelete.id)
    setDeleteDialogOpen(false)

    const result = await deleteRing(ringToDelete.id)

    if (result.success || result.error === "NOT_FOUND") {
      if (result.error === "NOT_FOUND") {
        toast({
          title: "Actualizado",
          description: "Este anillo ya no existía.",
        })
      } else {
        toast({
          title: "Anillo eliminado",
          description: `${ringToDelete.code} se eliminó correctamente`,
        })
      }
      // Force server refresh to get new data from DB
      router.refresh()
    } else if (result.error) {
      if (result.error === "CONSTRAINT") {
        toast({
          title: "No se pudo eliminar",
          description: result.message || "No se pudo eliminar porque está relacionado con otros datos.",
          variant: "destructive",
        })
      } else if (result.error === "VERIFY_FAILED") {
        toast({
          title: "Error al eliminar",
          description: result.message || "No se pudo eliminar. Intenta de nuevo.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error al eliminar",
          description: result.message || "Ocurrió un error al eliminar el anillo.",
          variant: "destructive",
        })
      }
    }

    setDeletingId(null)
    setRingToDelete(null)
  }

  return (
  return (
    <div className="space-y-6">
      {/* Search and Sort Section - Premium card style */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 sm:p-5">
        <div className="space-y-3 sm:space-y-0 sm:flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar anillos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 rounded-md h-10"
            />
          </div>

          {/* Sort dropdown */}
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white border-slate-200 h-10 rounded-md">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
              <SelectItem value="name_desc">Nombre: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500 mt-3">
          {filteredAndSortedRings.length} {filteredAndSortedRings.length === 1 ? "anillo" : "anillos"}
          {searchQuery && ` encontrado${filteredAndSortedRings.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Ring list */}
      {filteredAndSortedRings.length === 0 ? (
        <div className="text-center py-16 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-slate-500">
            {searchQuery ? "No se encontraron anillos" : "No hay anillos en el catálogo"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedRings.map((ring) => (
            <div
              key={ring.id}
              className={`bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all ${
                deletingId === ring.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex gap-4">
                {/* Thumbnail - left side */}
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <Image
                    src={ring.image_url || "/placeholder.svg"}
                    alt={ring.code}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info - center */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  {/* Title and badges */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-base text-slate-900">{ring.code}</span>
                      {!ring.is_active && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-0">
                          Inactivo
                        </Badge>
                      )}
                      {ring.featured && (
                        <Badge className="text-xs bg-amber-100 text-amber-900 border-0 hover:bg-amber-100">
                          Destacado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-1">{ring.name}</p>
                  </div>

                  {/* Details - small and compact */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span className="font-semibold text-slate-900">${ring.price.toLocaleString("es-MX")}</span>
                    <span>{ring.diamond_points} pts</span>
                    <span>{ring.metal_color} {ring.metal_karat}</span>
                  </div>
                </div>

                {/* Actions - right side, compact */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(ring)}
                    disabled={togglingId === ring.id}
                    className="h-8 px-2 bg-white border-slate-200 text-xs"
                  >
                    {togglingId === ring.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : ring.is_active ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <RingFormDialog
                    mode="edit"
                    ring={ring}
                    onSuccess={() => router.refresh()}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(ring)}
                    disabled={deletingId === ring.id}
                    className="h-8 px-2 bg-white border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                  >
                    {deletingId === ring.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar anillo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El anillo {ringToDelete?.code} será eliminado permanentemente del
              catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
