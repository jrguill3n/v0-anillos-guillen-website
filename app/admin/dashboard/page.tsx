import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { logoutAdmin } from "../actions"
import { Button } from "@/components/ui/button"
import { AdminRefreshButton } from "@/components/admin/admin-refresh-button"
import { AdminRingsListServer } from "@/components/admin/admin-rings-list-server"

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

  // TEMPORARY DEBUG: Log ring IDs for verification
  if (rings && rings.length > 0) {
    console.log(`[v0] [${correlationId}] Ring IDs (first 10):`, rings.slice(0, 10).map((r: any) => r.id).join(", "))
    const has2322 = rings.some((r: any) => r.code === "Anillo 2322" || r.slug === "anillo-2322")
    console.log(`[v0] [${correlationId}] Anillo 2322 in DB: ${has2322}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl font-serif font-bold">Admin</h1>
              <p className="text-xs text-muted-foreground">
                Anillos: {rings?.length || 0} | Última carga: {timestamp}
              </p>
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
        {/* TEMPORARY DEBUG: Show data source */}
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
          <p>Rings from DB: {rings?.length || 0}</p>
          <p>IDs: {rings?.slice(0, 10).map((r: any) => r.id.slice(0, 8)).join(", ") || "none"}</p>
          <p>Codes: {rings?.slice(0, 10).map((r: any) => r.code).join(", ") || "none"}</p>
        </div>

        {/* Server-rendered rings list - NO client-side state mirroring */}
        <AdminRingsListServer rings={rings || []} />
      </main>
    </div>
  )
}
