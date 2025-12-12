import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function logDbConnection(context: string) {
  const supabaseUrl = process.env.SUPABASE_URL
  const dbHost = supabaseUrl ? new URL(supabaseUrl).host : "MISSING"
  const correlationId = Math.random().toString(36).substring(2, 10)

  console.log(`[v0] [${correlationId}] [${context}] DB Connection:`, {
    host: dbHost,
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_ANON_KEY,
    timestamp: new Date().toISOString(),
  })

  return correlationId
}

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Missing Supabase environment variables!")
    throw new Error("Missing Supabase environment variables")
  }

  logDbConnection("CREATE_CLIENT")

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      },
    },
  })
}

export { logDbConnection }
