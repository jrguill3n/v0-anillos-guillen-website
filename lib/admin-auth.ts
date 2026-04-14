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

export function verifyAdminCredentials(credential: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error("[v0] ADMIN_PASSWORD environment variable is not set")
    return false
  }

  // Support both username and email
  const credentialMatch =
    (adminUsername && credential === adminUsername) || (adminEmail && credential === adminEmail)

  if (!credentialMatch) {
    console.warn("[v0] Admin login attempt with invalid username/email")
    return false
  }

  const passwordMatch = password === adminPassword

  if (!passwordMatch) {
    console.warn("[v0] Admin login attempt with invalid password")
    return false
  }

  return true
}
