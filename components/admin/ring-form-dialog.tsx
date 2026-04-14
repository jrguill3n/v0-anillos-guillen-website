"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Upload, X } from "lucide-react"
import { createRing, updateRing, uploadRingImage } from "@/app/admin/actions"
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
  image_url: string
  featured: boolean
  is_active: boolean
}

type RingFormDialogProps = {
  mode: "create" | "edit"
  ring?: Ring
  onSuccess?: (ring: Ring) => void
}

export function RingFormDialog({ mode, ring, onSuccess }: RingFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [featured, setFeatured] = useState(ring?.featured ?? false)
  const [isActive, setIsActive] = useState(ring?.is_active ?? true)
  const [imageUrl, setImageUrl] = useState(ring?.image_url ?? "")
  const [imagePreview, setImagePreview] = useState(ring?.image_url ?? "")
  const [goldKarat, setGoldKarat] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (ring && open) {
      setFeatured(ring.featured ?? false)
      setIsActive(ring.is_active ?? true)
      setImageUrl(ring.image_url ?? "")
      setImagePreview(ring.image_url ?? "")
      const karat = ring.metal_karat || ""
      setGoldKarat(karat.toLowerCase().includes("k") ? karat.toLowerCase() : karat ? `${karat}k` : "14k")
    } else if (!ring && open) {
      setFeatured(false)
      setIsActive(true)
      setImageUrl("")
      setImagePreview("")
      setGoldKarat("14k")
    }
  }, [ring, open])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    const result = await uploadRingImage(formData)

    setIsUploading(false)

    if (result.error) {
      toast({
        title: "Error al subir imagen",
        description: result.error,
        variant: "destructive",
      })
      setImagePreview(imageUrl)
    } else {
      setImageUrl(result.url!)
      toast({
        title: "Imagen subida",
        description: "La imagen se subió correctamente",
      })
    }
  }

  function handleClearImage() {
    setImageUrl("")
    setImagePreview("")
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    formData.set("featured", featured.toString())
    formData.set("is_active", isActive.toString())
    formData.set("image_url", imageUrl)
    formData.set("metal_karat", goldKarat)

    const result = mode === "create" ? await createRing(formData) : await updateRing(ring!.id, formData)

    setIsSubmitting(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: mode === "create" ? "Anillo creado" : "Anillo actualizado",
        description: `El anillo se ${mode === "create" ? "creó" : "actualizó"} correctamente`,
      })

      if (onSuccess && result.ring) {
        onSuccess(result.ring)
      }

      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 h-10 px-4 sm:px-5">
            <Plus className="h-4 w-4" />
            <span className="font-medium">Nuevo anillo</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-1"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
        <DialogHeader className="pb-4 border-b border-slate-200">
          <DialogTitle className="text-xl font-light">
            {mode === "create" ? "Crear nuevo anillo" : "Editar anillo"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {mode === "create" ? "Completa los datos del nuevo anillo" : "Modifica los datos del anillo"}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 py-4">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Información básica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Código *
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={ring?.code}
                  placeholder="Ej: 0122"
                  className="bg-slate-50 border-slate-200 h-10 rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio (MXN) *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={ring?.price}
                  placeholder="15000"
                  className="bg-slate-50 border-slate-200 h-10 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Diamond & Metal Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Detalles del anillo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diamond_points" className="text-sm font-medium">
                  Puntos diamante *
                </Label>
                <Input
                  id="diamond_points"
                  name="diamond_points"
                  type="number"
                  step="0.01"
                  defaultValue={ring?.diamond_points}
                  placeholder="13"
                  className="bg-slate-50 border-slate-200 h-10 rounded-md"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metal_color" className="text-sm font-medium">
                  Color de oro *
                </Label>
                <Select name="metal_color" defaultValue={ring?.metal_color || "amarillo"}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-10 rounded-md">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amarillo">Amarillo</SelectItem>
                    <SelectItem value="blanco">Blanco</SelectItem>
                    <SelectItem value="rosa">Rosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metal_karat" className="text-sm font-medium">
                  Kilates *
                </Label>
                <Select name="metal_karat" value={goldKarat} onValueChange={setGoldKarat}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 h-10 rounded-md">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10k">10k</SelectItem>
                    <SelectItem value="14k">14k</SelectItem>
                    <SelectItem value="18k">18k</SelectItem>
                    <SelectItem value="24k">24k</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Descripción</h3>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción *
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={ring?.description}
                placeholder="Describe el anillo brevemente..."
                rows={3}
                className="bg-slate-50 border-slate-200 rounded-md resize-none"
                required
              />
              <p className="text-xs text-slate-500">Se recomienda una descripción clara y concisa.</p>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Imagen</h3>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full aspect-square max-w-xs mx-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img src={imagePreview || "/placeholder.svg"} alt="Vista previa" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700"
                    onClick={handleClearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="flex-1 bg-slate-50 border-slate-200 h-10 rounded-md"
                />
                {isUploading && (
                  <Button type="button" disabled className="gap-2 bg-slate-900">
                    <Upload className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Subiendo...</span>
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500">JPG, PNG, WEBP. Máximo 5MB. Se recomienda 800x800px.</p>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Estado</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <Label htmlFor="is_active" className="font-medium text-sm">
                  Publicado
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">Visible en el catálogo público</p>
              </div>
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="bg-white border-slate-200 h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !imageUrl || isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 h-10"
            >
              {isSubmitting ? "Guardando..." : mode === "create" ? "Crear anillo" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
