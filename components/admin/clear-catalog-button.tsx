"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ClearCatalogButtonProps = {
  onClear: () => Promise<{ success?: boolean; error?: string; deletedCount?: number; diagnostics?: any }>
}

type DiagnosticResult = {
  dbHost: string
  dbPort: string
  dbName: string
  dbSchema: string
  projectRef: string
  maskedHost: string
  beforeCount: number
  deletedCount: number
  afterCount: number
  transactionFailed: boolean
  warning?: string | null
}

export function ClearCatalogButton({ onClear }: ClearCatalogButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [lastDiagnostics, setLastDiagnostics] = useState<DiagnosticResult | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function handleClear() {
    setIsLoading(true)
    const result = await onClear()
    
    if (result.success) {
      // Close confirmation dialog
      setIsOpen(false)
      
      // Store diagnostics and show them
      if (result.diagnostics) {
        setLastDiagnostics(result.diagnostics)
        setShowDiagnostics(true)
      }
      
      toast({
        title: "Catálogo vaciado",
        description: `Deleted: ${result.diagnostics?.deletedCount || 0} rows`,
      })
      
      // Force full page refresh to ensure server re-renders with fresh data
      setTimeout(() => {
        router.refresh()
      }, 1000)
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

      {/* Diagnostic Modal */}
      <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Clear Operation Diagnostics</DialogTitle>
            <DialogDescription>Write DB diagnostics from clearAllRings()</DialogDescription>
          </DialogHeader>
          {lastDiagnostics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delete Transaction Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className={`p-3 rounded border-2 ${lastDiagnostics.transactionFailed ? "border-red-300 bg-red-50 dark:bg-red-900/20" : "border-green-300 bg-green-50 dark:bg-green-900/20"}`}>
                  <p className={`font-bold ${lastDiagnostics.transactionFailed ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                    {lastDiagnostics.transactionFailed ? "❌ Transaction Failed" : "✅ Delete Successful"}
                  </p>
                  {lastDiagnostics.warning && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{lastDiagnostics.warning}</p>
                  )}
                </div>

                {/* Counts */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Before</p>
                    <p className="text-2xl font-bold">{lastDiagnostics.beforeCount}</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Deleted</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lastDiagnostics.deletedCount}</p>
                  </div>
                  <div className={`p-3 rounded ${lastDiagnostics.afterCount > 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-green-100 dark:bg-green-900/20"}`}>
                    <p className="text-xs text-muted-foreground">After</p>
                    <p className={`text-2xl font-bold ${lastDiagnostics.afterCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                      {lastDiagnostics.afterCount}
                    </p>
                  </div>
                </div>

                {/* Connection Details */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Write DB Connection:</h4>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs font-mono space-y-1">
                    <div>Host: {lastDiagnostics.dbHost}:{lastDiagnostics.dbPort}</div>
                    <div>Name: {lastDiagnostics.dbName}</div>
                    <div>Schema: {lastDiagnostics.dbSchema}</div>
                    <div>ProjectRef: {lastDiagnostics.projectRef}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
