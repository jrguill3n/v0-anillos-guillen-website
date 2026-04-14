import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createClient, logDbConnection, getDbDiagnostics } from "@/lib/supabase/server"
import { logoutAdmin, clearAllRings, diagnosticCatalog } from "../actions"
import { Button } from "@/components/ui/button"
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button"
import { AdminRingsListServer } from "@/components/admin/admin-rings-list-server"
import { RingFormDialog } from "@/components/admin/ring-form-dialog"
import { ClearCatalogButton } from "@/components/admin/clear-catalog-button"
import { DataSourceDebug } from "@/components/admin/data-source-debug"
import { DiagnosticDialog } from "@/components/admin/diagnostic-dialog"
import { DbComparisonPanel } from "@/components/admin/db-comparison-panel"
import { RowIdentityDiagnostic } from "@/components/admin/row-identity-diagnostic"
import { UnifiedDbDiagnostic } from "@/components/admin/unified-db-diagnostic"
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

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect("/admin")
  }

  const correlationId = logDbConnection("LIST_ADMIN")
  const supabase = await createClient()
  const dbDiag = getDbDiagnostics()

  console.log(`[v0] [${correlationId}] LIST_ADMIN: DB Host: ${dbDiag.dbHost} | Port: ${dbDiag.dbPort} | Name: ${dbDiag.dbName} | User: ${dbDiag.dbUser} | Schema: ${dbDiag.dbSchema}`)

  const { data: rings, error } = await supabase
    .from("rings")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    console.error(`[v0] [${correlationId}] LIST_ADMIN: Error fetching rings:`, error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error al cargar anillos</h1>
          <p className="text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const timestamp = new Date().toLocaleTimeString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  console.log(`[v0] [${correlationId}] LIST_ADMIN: Fetched ${rings?.length || 0} rings at ${timestamp}`)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl font-serif font-bold">Admin</h1>
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded border border-blue-200 dark:border-blue-800 font-mono space-y-1">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-blue-700 dark:text-blue-300">
                    <span>Read Host:</span>
                    <span className="font-semibold">{dbDiag.maskedDbHost}</span>
                    <span>Read Port:</span>
                    <span className="font-semibold">{dbDiag.dbPort}</span>
                    <span>Read Name:</span>
                    <span className="font-semibold">{dbDiag.dbName}</span>
                    <span>Read User:</span>
                    <span className="font-semibold">{dbDiag.dbUser}</span>
                    <span>Read Schema:</span>
                    <span className="font-semibold">{dbDiag.dbSchema}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Rings in DB: <span className="font-mono font-semibold text-foreground">{rings?.length || 0}</span>
                </p>
                <p className="text-muted-foreground">Última carga: {timestamp}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AdminRefreshButton />
              <Button asChild variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                <a href="/api/admin/generate-catalog-pdf" download>
                  Descargar Catálogo
                </a>
              </Button>
              <form action={logoutAdmin}>
                <Button variant="ghost" size="sm">
                  Salir
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* UNIFIED DB DIAGNOSTIC - Shows Read vs Write */}
        <div className="mb-6">
          <UnifiedDbDiagnostic />
        </div>

        <div className="mb-6">
          <DbComparisonPanel 
            readDiagnostics={{
              dbHost: dbDiag.dbHost,
              dbPort: dbDiag.dbPort,
              dbName: dbDiag.dbName,
              dbSchema: dbDiag.dbSchema,
              projectRef: dbDiag.projectRef,
              rowsReturned: rings?.length || 0,
              sourceType: "TABLE",
            }}
          />
        </div>

        <DataSourceDebug
          pageType="admin"
          ringCount={rings?.length || 0}
          firstCodes={(rings || []).slice(0, 5).map((r) => r.code)}
          fetchedAt={timestamp}
          dbHost={process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] || "supabase"}
          rowsReturned={rings?.length || 0}
        />

        <div className="flex gap-2 mb-6 justify-end">
          <DiagnosticDialog />
        </div>

        {/* Row Identity Diagnostic - Temporary Debug */}
        <div className="mb-6">
          <RowIdentityDiagnostic />
        </div>

        {rings && rings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="space-y-4 max-w-md">
              <h2 className="text-2xl font-semibold">No hay anillos cargados</h2>
              <p className="text-muted-foreground">
                Empieza agregando tu primer anillo manualmente desde el panel de administración.
              </p>
              <RingFormDialog mode="create" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{rings?.length || 0} anillos en el catálogo</h2>
              <div className="flex gap-2">
                <RingFormDialog mode="create" />
                <ClearCatalogButton onClear={clearAllRings} />
              </div>
            </div>
            <AdminRingsListServer rings={rings || []} />
          </div>
        )}
      </main>
    </div>
  )
}
