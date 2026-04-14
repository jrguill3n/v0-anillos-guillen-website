"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

type ClearCatalogButtonProps = {
  onClear: () => Promise<{ success?: boolean; error?: string; deletedCount?: number; diagnostics?: any }>
}

export function ClearCatalogButton({ onClear }: ClearCatalogButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleClear() {
    setIsLoading(true)
    const result = await onClear()
    
    if (result.success) {
      // Close dialog first
      setIsOpen(false)
      
      const diag = result.diagnostics
      const diagMsg = diag ? 
        `Write DB: ${diag.maskedHost}:${diag.dbPort} (${diag.dbName})\nBefore: ${diag.ringsBefore} | After: ${diag.ringsAfter} | Deleted: ${diag.deletedRows}` :
        `Se eliminaron ${result.deletedCount || 0} anillos`
      
      toast({
        title: "Catálogo vaciado",
        description: diagMsg,
      })
      
      // Force full page refresh to ensure server re-renders with fresh data
      router.refresh()
    } else {
      const diag = result.diagnostics
      const diagMsg = diag ? 
        `Write DB: ${diag.maskedHost}:${diag.dbPort} (${diag.dbName}) - Transaction failed` :
        (result.error || "No se pudo vaciar el catálogo")
      
      toast({
        title: "Error",
        description: diagMsg,
        variant: "destructive",
      })
    }
    
    setIsLoading(false)
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Vaciar catálogo</span>
        <span className="sm:hidden">Vaciar</span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vaciar catálogo</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará todos los anillos cargados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Sí, vaciar catálogo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
