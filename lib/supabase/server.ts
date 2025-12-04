import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function createNoOpClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({ data: null, error: new Error("Supabase not configured") }),
        single: () => ({ data: null, error: new Error("Supabase not configured") }),
        data: [],
        error: new Error("Supabase not configured"),
      }),
      insert: () => ({ data: null, error: new Error("Supabase not configured") }),
      update: () => ({ data: null, error: new Error("Supabase not configured") }),
      delete: () => ({ data: null, error: new Error("Supabase not configured") }),
      upsert: () => ({ data: null, error: new Error("Supabase not configured") }),
    }),
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: new Error("Supabase not configured") }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  } as any
}

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Missing Supabase environment variables - using no-op client")
    return createNoOpClient()
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
