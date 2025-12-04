import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "admin_session"
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get(ADMIN_COOKIE_NAME)
  return adminSession?.value === "authenticated"
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error("[v0] ADMIN_EMAIL and ADMIN_PASSWORD environment variables are not set")
    return false
  }

  return email === adminEmail && password === adminPassword
}
