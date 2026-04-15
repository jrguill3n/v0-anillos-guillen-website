import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { logoutAdmin } from "../actions"
import { Button } from "@/components/ui/button"
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button"
import { AdminRingsListServer } from "@/components/admin/admin-rings-list-server"
import { RingFormDialog } from "@/components/admin/ring-form-dialog"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect("/admin")
  }

  const correlationId = logDbConnection("LIST_ADMIN")
  const supabase = await createClient()

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
    <div className="min-h-screen bg-white">
      {/* Premium sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* Header content */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title section */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Admin</h1>
              <p className="text-sm text-slate-500 mt-1">Gestiona tu catálogo de anillos</p>
            </div>

            {/* Actions - grid on mobile, row on desktop */}
            <div className="flex flex-wrap gap-2 items-center">
              <RingFormDialog mode="create" />
              <AdminRefreshButton />
              <Button asChild variant="outline" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 font-medium">
                <a href="/api/admin/generate-catalog-pdf" download="catalogo-anillos-guillen.pdf">
                  Descargar catálogo PDF
                </a>
              </Button>
              <form action={logoutAdmin}>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-10 px-4 font-medium">
                  Salir
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {rings && rings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
            <div className="space-y-4 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-light">No hay anillos cargados</h2>
              <p className="text-slate-600">
                Empieza agregando tu primer anillo manualmente desde el panel de administración.
              </p>
              <div className="pt-4">
                <RingFormDialog mode="create" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AdminRingsListServer rings={rings || []} />
          </div>
        )}
      </main>
    </div>
  )
}
