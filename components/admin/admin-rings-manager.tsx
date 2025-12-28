"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  diamond_color: string
  diamond_clarity: string
  image_url: string
  slug: string
  featured: boolean
  is_active: boolean
  order_index: number
}

type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc"

export function AdminRingsManager({ initialRings }: { initialRings: Ring[] }) {
  const [rings, setRings] = useState(initialRings)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("price_asc")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ringToDelete, setRingToDelete] = useState<Ring | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Filter and sort rings
  const filteredAndSortedRings = useMemo(() => {
    let filtered = rings

    // Filter by search query
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

    // Sort
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
  }, [rings, searchQuery, sortOption])

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
      // Update local state immediately
      setRings((prev) => prev.map((r) => (r.id === ring.id ? { ...r, is_active: !r.is_active } : r)))
      toast({
        title: ring.is_active ? "Anillo desactivado" : "Anillo activado",
      })
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

    if (result.error) {
      // Handle "not found" gracefully - remove from UI
      if (result.error === "NOT_FOUND") {
        setRings((prev) => prev.filter((r) => r.id !== ringToDelete.id))
        toast({
          title: "Actualizado",
          description: "Este anillo ya no existe, se actualizó la lista.",
        })
        router.refresh()
      } else if (result.error === "CONSTRAINT") {
        // Foreign key constraint error
        toast({
          title: "No se pudo eliminar",
          description: result.message || "No se pudo eliminar porque está relacionado con otros datos.",
          variant: "destructive",
        })
      } else if (result.error === "VERIFY_FAILED") {
        // Verification failed - ring still exists
        toast({
          title: "Error al eliminar",
          description: result.message || "No se pudo eliminar. Intenta de nuevo.",
          variant: "destructive",
        })
      } else {
        // Generic error
        toast({
          title: "Error al eliminar",
          description: result.message || "Ocurrió un error al eliminar el anillo.",
          variant: "destructive",
        })
      }
      setDeletingId(null)
    } else {
      // Success! Remove from UI immediately
      setRings((prev) => prev.filter((r) => r.id !== ringToDelete.id))
      toast({
        title: "Anillo eliminado",
        description: `${ringToDelete.code} se eliminó correctamente`,
      })
      router.refresh()
      setDeletingId(null)
    }

    setRingToDelete(null)
  }

  return (
    <div className="space-y-4">
      {/* Search and controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
            <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
            <SelectItem value="name_desc">Nombre: Z-A</SelectItem>
          </SelectContent>
        </Select>

        <RingFormDialog mode="create" onSuccess={(newRing) => setRings((prev) => [...prev, newRing])} />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredAndSortedRings.length} {filteredAndSortedRings.length === 1 ? "anillo" : "anillos"}
        {searchQuery && ` encontrado${filteredAndSortedRings.length !== 1 ? "s" : ""}`}
      </p>

      {/* Mobile card list */}
      {filteredAndSortedRings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery ? "No se encontraron anillos" : "No hay anillos en el catálogo"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedRings.map((ring) => (
            <div
              key={ring.id}
              className={`flex gap-4 p-4 bg-card border rounded-lg transition-opacity ${
                deletingId === ring.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Left side: Thumbnail + Info */}
              <div className="flex gap-4 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="relative h-12 w-12 sm:h-10 sm:w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  <Image src={ring.image_url || "/placeholder.svg"} alt={ring.name} fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-lg">{ring.code}</span>
                      {!ring.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactivo
                        </Badge>
                      )}
                      {ring.featured && (
                        <Badge variant="default" className="text-xs">
                          Destacado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ring.name}</p>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    <span className="font-semibold text-primary">${ring.price.toLocaleString("es-MX")}</span>
                    <span className="text-muted-foreground">{ring.diamond_points} pts</span>
                    <span className="text-muted-foreground">
                      {ring.metal_color} {ring.metal_karat}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(ring)}
                  disabled={togglingId === ring.id}
                  className="gap-2 w-full sm:w-auto"
                >
                  {togglingId === ring.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : ring.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{ring.is_active ? "Activo" : "Inactivo"}</span>
                </Button>

                <RingFormDialog
                  mode="edit"
                  ring={ring}
                  onSuccess={(updatedRing) => setRings((prev) => prev.map((r) => (r.id === ring.id ? updatedRing : r)))}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDeleteDialog(ring)}
                  disabled={deletingId === ring.id}
                  className="gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
                >
                  {deletingId === ring.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </>
                  )}
                </Button>
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
