import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { loginAdmin } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function AdminLoginPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (isAuthenticated) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-light tracking-tight">Acceso Admin</h1>
          <p className="text-sm text-slate-600">Ingresa tus credenciales para acceder al panel de administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form action={loginAdmin} className="space-y-6">
            {/* Credential Field (username or email) */}
            <div className="space-y-3">
              <Label htmlFor="credential" className="text-sm font-medium text-slate-900">
                Usuario o Email
              </Label>
              <Input
                id="credential"
                name="credential"
                type="text"
                placeholder="tu usuario o email"
                autoComplete="username"
                className="h-11 rounded-lg bg-slate-50 border border-slate-200 px-4 text-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-0"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-slate-900">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 rounded-lg bg-slate-50 border border-slate-200 px-4 text-sm transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-0"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
            >
              Iniciar sesión
            </Button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-slate-500">
          Panel de administración protegido • Anillos Guillén
        </p>
      </div>
    </div>
  )
}

