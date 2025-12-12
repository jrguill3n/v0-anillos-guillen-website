import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createClient, logDbConnection } from "@/lib/supabase/server"
import { logoutAdmin } from "../actions"
import { Button } from "@/components/ui/button"
import { AdminRingsManager } from "@/components/admin/admin-rings-manager"
import { AdminDebugPanel } from "@/components/admin/admin-debug-panel"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect("/admin")
  }

  const correlationId = logDbConnection("LIST_ADMIN")
  const supabase = await createClient()

  const { data: rings, error } = await supabase.from("rings").select("*").order("order_index", { ascending: true })

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

  console.log(`[v0] [${correlationId}] LIST_ADMIN: Fetched ${rings?.length || 0} rings at ${new Date().toISOString()}`)

  const showDebug = process.env.ENABLE_DEBUG_UI === "true"

  return (
    <div className="min-h-screen bg-background">
      {/* <!-- rings_count: ${rings?.length || 0} timestamp: ${new Date().toISOString()} --> */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold">Admin</h1>
            <div className="flex items-center gap-2">
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
        {showDebug && <AdminDebugPanel rings={rings || []} />}

        <AdminRingsManager initialRings={rings || []} />
      </main>
    </div>
  )
}
