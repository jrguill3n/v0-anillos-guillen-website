"use client"

import type React from "react"

import { useState } from "react"
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
  diamond_color: string
  diamond_clarity: string
  image_url: string
  featured: boolean
  is_active: boolean
}

type RingFormDialogProps = {
  mode: "create" | "edit"
  ring?: Ring
}

export function RingFormDialog({ mode, ring }: RingFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [featured, setFeatured] = useState(ring?.featured ?? false)
  const [isActive, setIsActive] = useState(ring?.is_active ?? true)
  const [imageUrl, setImageUrl] = useState(ring?.image_url ?? "")
  const [imagePreview, setImagePreview] = useState(ring?.image_url ?? "")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

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
    formData.set("featured", featured.toString())
    formData.set("is_active", isActive.toString())
    formData.set("image_url", imageUrl)

    const result = mode === "create" ? await createRing(formData) : await updateRing(ring!.id, formData)

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
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo anillo
          </Button>
        ) : (
          <Button variant="ghost" size="icon" title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Crear nuevo anillo" : "Editar anillo"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Completa los datos del nuevo anillo" : "Modifica los datos del anillo"}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" name="code" defaultValue={ring?.code} placeholder="0122" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (MXN) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={ring?.price}
                placeholder="15000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={ring?.name}
              placeholder="Anillo de compromiso solitario"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={ring?.description}
              placeholder="Hermoso anillo de compromiso con diseño clásico..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagen del anillo *</Label>
            <div className="flex flex-col gap-4">
              {imagePreview && (
                <div className="relative w-full aspect-square max-w-xs mx-auto overflow-hidden rounded-lg border">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
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
                  className="flex-1"
                />
                {isUploading && (
                  <Button type="button" disabled className="gap-2">
                    <Upload className="h-4 w-4 animate-pulse" />
                    Subiendo...
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos: JPG, PNG, WEBP. Tamaño máximo: 5MB. Se recomienda usar imágenes cuadradas de al menos
                800x800px.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metal_type">Tipo de metal *</Label>
              <Select name="metal_type" defaultValue={ring?.metal_type || "oro"}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oro">Oro</SelectItem>
                  <SelectItem value="platino">Platino</SelectItem>
                  <SelectItem value="plata">Plata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metal_karat">Kilates *</Label>
              <Select name="metal_karat" defaultValue={ring?.metal_karat || "14k"}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="metal_color">Color *</Label>
              <Select name="metal_color" defaultValue={ring?.metal_color || "amarillo"}>
                <SelectTrigger>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diamond_points">Puntos diamante *</Label>
              <Input
                id="diamond_points"
                name="diamond_points"
                type="number"
                step="0.01"
                defaultValue={ring?.diamond_points}
                placeholder="5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamond_color">Color diamante *</Label>
              <Select name="diamond_color" defaultValue={ring?.diamond_color || "G"}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="H">H</SelectItem>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="J">J</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamond_clarity">Claridad diamante *</Label>
              <Select name="diamond_clarity" defaultValue={ring?.diamond_clarity || "VS1"}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FL">FL</SelectItem>
                  <SelectItem value="IF">IF</SelectItem>
                  <SelectItem value="VVS1">VVS1</SelectItem>
                  <SelectItem value="VVS2">VVS2</SelectItem>
                  <SelectItem value="VS1">VS1</SelectItem>
                  <SelectItem value="VS2">VS2</SelectItem>
                  <SelectItem value="SI1">SI1</SelectItem>
                  <SelectItem value="SI2">SI2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="featured" className="font-medium">
                Destacado
              </Label>
              <p className="text-sm text-muted-foreground">Aparecerá en la página principal</p>
            </div>
            <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="is_active" className="font-medium">
                Activo
              </Label>
              <p className="text-sm text-muted-foreground">Visible en el catálogo público</p>
            </div>
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading || !imageUrl}>
              {mode === "create" ? "Crear anillo" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
