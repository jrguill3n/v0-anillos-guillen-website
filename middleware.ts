import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_COOKIE_NAME = "admin_session"
const PROTECTED_ROUTES = ["/admin/dashboard"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected) {
    const adminSession = request.cookies.get(ADMIN_COOKIE_NAME)

    // If not authenticated, redirect to login
    if (!adminSession || adminSession.value !== "authenticated") {
      const loginUrl = new URL("/admin", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
