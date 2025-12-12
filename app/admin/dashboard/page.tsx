import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"
import { logoutAdmin } from "../actions"
import { Button } from "@/components/ui/button"
import { AdminRingsManager } from "@/components/admin/admin-rings-manager"

export const dynamic = "force-dynamic"
export const revalidate = 0

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

  console.log(`[v0] Admin dashboard loaded: ${rings?.length || 0} rings at ${new Date().toISOString()}`)

  return (
    <div className="min-h-screen bg-background">
      {/* rings_count: ${rings?.length || 0} */}
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
        <AdminRingsManager initialRings={rings || []} />
      </main>
    </div>
  )
}
