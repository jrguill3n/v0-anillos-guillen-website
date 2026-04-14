"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { diagnosticCatalog } from "@/app/admin/actions"

export function DiagnosticDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function runDiagnostic() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await diagnosticCatalog()
      setResults(result)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Diagnosticar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Diagnóstico del Catálogo</DialogTitle>
          <DialogDescription>
            Información detallada sobre el estado de la base de datos de anillos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={runDiagnostic} disabled={isLoading} className="w-full">
            {isLoading ? "Ejecutando..." : "Ejecutar Diagnóstico"}
          </Button>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6 text-red-800">{error}</CardContent>
            </Card>
          )}

          {results && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total de anillos:</span>
                    <span className="font-semibold">{results.totalCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Anillos activos:</span>
                    <span className="font-semibold">{results.activeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Anillo 2322 existe:</span>
                    <span className={`font-semibold ${results.has2322 ? "text-green-600" : "text-red-600"}`}>
                      {results.has2322 ? "Sí" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {results.duplicateCodes && results.duplicateCodes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">⚠️ Códigos Duplicados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {results.duplicateCodes.map((item: any) => (
                      <div key={item.code} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="font-mono">
                          {item.code} ({item.count} instancias)
                        </div>
                        <div className="text-xs text-slate-600 mt-1">IDs: {item.ids.join(", ")}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {results.duplicateSlugs && results.duplicateSlugs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">⚠️ Slugs Duplicados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {results.duplicateSlugs.map((item: any) => (
                      <div key={item.slug} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="font-mono">
                          {item.slug} ({item.count} instancias)
                        </div>
                        <div className="text-xs text-slate-600 mt-1">IDs: {item.ids.join(", ")}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
