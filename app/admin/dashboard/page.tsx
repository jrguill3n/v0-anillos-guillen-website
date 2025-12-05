import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { logoutAdmin } from "../actions"
import { Button } from "@/components/ui/button"
import { RingsTable } from "@/components/admin/rings-table"
import { RingFormDialog } from "@/components/admin/ring-form-dialog"

export default async function AdminDashboardPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect("/admin")
  }

  const supabase = await createClient()
  const { data: rings, error } = await supabase.from("rings").select("*").order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching rings:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Gestión de anillos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <a href="/api/admin/generate-catalog-pdf" download>
                Descargar Catálogo
              </a>
            </Button>
            <form action={logoutAdmin}>
              <Button variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Catálogo de anillos</h2>
          <RingFormDialog mode="create" />
        </div>

        <RingsTable rings={rings || []} />
      </main>
    </div>
  )
}
