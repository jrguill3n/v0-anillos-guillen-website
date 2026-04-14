"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { checkRowIdentityIssues } from "@/app/admin/actions"

export function RowIdentityDiagnostic() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showIssues, setShowIssues] = useState(false)

  async function handleCheck() {
    setIsLoading(true)
    const diagnostic = await checkRowIdentityIssues("Anillo 2322")
    setResult(diagnostic)
    setShowIssues(true)
    setIsLoading(false)
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={handleCheck} disabled={isLoading} variant="secondary">
          {isLoading ? "Verificando..." : "Diagnosticar identidad de filas"}
        </Button>
      </div>

      {showIssues && result && (
        <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              Diagnóstico de Identidad de Filas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total de anillos:</p>
                <p className="font-bold text-lg">{result.totalRings}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Códigos duplicados:</p>
                <p className={`font-bold text-lg ${result.duplicateCodesCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {result.duplicateCodesCount}
                </p>
              </div>
            </div>

            {/* Duplicate codes */}
            {result.duplicateCodes && result.duplicateCodes.length > 0 && (
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded border border-red-300 dark:border-red-800">
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Códigos Duplicados:</h4>
                {result.duplicateCodes.map((dup: any) => (
                  <div key={dup.code} className="text-xs font-mono space-y-1 mb-2">
                    <div className="font-bold">{dup.code} (×{dup.count})</div>
                    {dup.ids.map((id: string) => (
                      <div key={id} className="text-red-600 dark:text-red-300 ml-4">
                        id: {id}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Anillo 2322 specific check */}
            {result.targetCodeRows && result.targetCodeRows.length > 0 && (
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded border border-orange-300 dark:border-orange-800">
                <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                  Búsqueda: "Anillo 2322" ({result.targetCodeRows.length} filas encontradas)
                </h4>
                {result.targetCodeRows.map((ring: any) => (
                  <div key={ring.id} className="text-xs font-mono mb-2 space-y-1">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded">
                      <div>
                        <span className="text-muted-foreground">ID:</span> {ring.id}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Code:</span> {ring.code}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Slug:</span> {ring.slug}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.targetCodeRows && result.targetCodeRows.length === 0 && (
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded border border-green-300 dark:border-green-800">
                <p className="text-green-700 dark:text-green-400 text-sm">
                  No se encontró "Anillo 2322" en la base de datos. ✓
                </p>
              </div>
            )}

            {/* Slug duplicates */}
            {result.duplicateSlugs && result.duplicateSlugs.length > 0 && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded border border-yellow-300 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Slugs Duplicados:</h4>
                {result.duplicateSlugs.map((dup: any) => (
                  <div key={dup.slug} className="text-xs font-mono space-y-1 mb-2">
                    <div className="font-bold">{dup.slug} (×{dup.count})</div>
                    {dup.ids.map((id: string) => (
                      <div key={id} className="text-yellow-600 dark:text-yellow-300 ml-4">
                        id: {id}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
