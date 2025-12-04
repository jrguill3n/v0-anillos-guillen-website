import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Missing Supabase environment variables. Please check your Vercel project settings.")
    console.error("[v0] Required variables: SUPABASE_URL, SUPABASE_ANON_KEY")
    throw new Error(
      "Your project's URL and Key are required to create a Supabase client! " +
        "Check your Supabase project's API settings to find these values " +
        "https://supabase.com/dashboard/project/_/settings/api",
    )
  }

  console.log("[v0] Creating Supabase client successfully")

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
