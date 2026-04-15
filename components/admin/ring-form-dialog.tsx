"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    } else if (!ring && open) {
      setFeatured(false)
      setIsActive(true)
      setImageUrl("")
      setImagePreview("")
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
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 h-10 px-4 font-medium text-white">
            <Plus className="h-4 w-4" />
            <span>Nuevo anillo</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-8 px-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-1 font-medium"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-lg">
        <DialogHeader className="pb-5 border-b border-slate-100">
          <DialogTitle className="text-2xl font-light tracking-tight">
            {mode === "create" ? "Crear nuevo anillo" : "Editar anillo"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-sm">
            {mode === "create" ? "Completa los datos del nuevo anillo" : "Modifica los datos del anillo"}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-8 py-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Información básica</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-slate-900">
                  Código *
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={ring?.code}
                  placeholder="Ej: 0122"
                  className="bg-slate-50 border border-slate-200 h-11 rounded-lg text-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-slate-900">
                  Precio (MXN) *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={ring?.price}
                  placeholder="15000"
                  className="bg-slate-50 border border-slate-200 h-11 rounded-lg text-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Diamond & Metal Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Detalles del anillo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diamond_points" className="text-sm font-medium text-slate-900">
                  Puntos diamante *
                </Label>
                <Input
                  id="diamond_points"
                  name="diamond_points"
                  type="number"
                  step="0.01"
                  defaultValue={ring?.diamond_points}
                  placeholder="13"
                  className="bg-slate-50 border border-slate-200 h-11 rounded-lg text-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metal_color" className="text-sm font-medium text-slate-900">
                  Color de oro *
                </Label>
                <Select name="metal_color" defaultValue={ring?.metal_color || "amarillo"}>
                  <SelectTrigger className="bg-slate-50 border border-slate-200 h-11 rounded-lg text-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-0">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amarillo">Amarillo</SelectItem>
                    <SelectItem value="blanco">Blanco</SelectItem>
                    <SelectItem value="rosa">Rosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Imagen</h3>
            <div className="space-y-3">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full max-w-xs mx-auto">
                  <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                    <img src={imagePreview || "/placeholder.svg"} alt="Vista previa" className="h-full w-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 shadow-md"
                    onClick={handleClearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File Input - hidden, used by button */}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />

              {/* Upload Control - looks like a proper button/dropzone */}
              <label
                htmlFor="image"
                className={`flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isUploading
                    ? "bg-slate-50 border-slate-300 opacity-50"
                    : "bg-slate-50 border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-slate-200 rounded-full">
                    <Upload className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-900 text-sm sm:text-base">
                      {isUploading ? "Subiendo imagen..." : "Seleccionar imagen"}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {isUploading ? "Por favor espera..." : "Haz clic para seleccionar"}
                    </p>
                  </div>
                </div>
              </label>

              {/* Help text */}
              <p className="text-xs text-slate-500 text-center">
                JPG, PNG, WEBP • Máximo 5MB • Se recomienda 800×800px
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Estado</h3>
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl">
              <div>
                <Label htmlFor="is_active" className="font-medium text-sm text-slate-900">
                  Publicado
                </Label>
                <p className="text-xs text-slate-600 mt-1">Visible en el catálogo público</p>
              </div>
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="bg-white border border-slate-200 h-11 px-6 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !imageUrl || isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 h-11 px-8 rounded-lg font-medium text-sm text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : mode === "create" ? "Crear anillo" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
