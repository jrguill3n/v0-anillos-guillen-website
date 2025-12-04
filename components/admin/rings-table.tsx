"use client"

import { useState } from "react"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react"
import { deleteRing, toggleRingActive, updateRingOrder } from "@/app/admin/actions"
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
  AlertDialogTrigger,
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
  featured: boolean
  is_active: boolean
  order_index: number
}

function SortableRingRow({ ring }: { ring: Ring }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ring.id })
  const { toast } = useToast()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  async function handleToggleActive() {
    const result = await toggleRingActive(ring.id, ring.is_active)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    const result = await deleteRing(ring.id)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Anillo eliminado",
        description: "El anillo se eliminó correctamente",
      })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-accent rounded"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-4 items-center">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded overflow-hidden bg-muted">
          <Image src={ring.image_url || "/placeholder.svg"} alt={ring.name} fill className="object-cover" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold">{ring.code}</span>
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
          <p className="text-sm text-muted-foreground line-clamp-1">{ring.name}</p>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
            <span>${ring.price.toLocaleString("es-MX")}</span>
            <span>•</span>
            <span>{ring.diamond_points} pts</span>
            <span>•</span>
            <span>
              {ring.metal_color} {ring.metal_karat}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 justify-end sm:justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleActive}
            title={ring.is_active ? "Desactivar" : "Activar"}
          >
            {ring.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          <RingFormDialog mode="edit" ring={ring} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Eliminar">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar anillo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El anillo {ring.code} será eliminado permanentemente.
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
      </div>
    </div>
  )
}

export function RingsTable({ rings }: { rings: Ring[] }) {
  const [items, setItems] = useState(rings)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Update order_index for all affected items
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order_index: index,
      }))

      const result = await updateRingOrder(updates)
      if (result.error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el orden",
          variant: "destructive",
        })
        // Revert the order
        setItems(rings)
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No hay anillos en el catálogo</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((ring) => (
            <SortableRingRow key={ring.id} ring={ring} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
