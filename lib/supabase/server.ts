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

function getDbDiagnostics() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
  
  try {
    const url = new URL(supabaseUrl)
    const host = url.host
    const dbName = host.split(".")[0] || "UNKNOWN"
    const maskedHost = host.length > 8 ? `${host.substring(0, 4)}...${host.substring(host.length - 4)}` : host
    
    // For Supabase, default port is 6543 (PostgreSQL proxy) or 5432 (direct)
    // Supabase uses port 6543 for the REST API and 5432 for direct PostgreSQL connections
    const port = "6543" // Supabase PostgreSQL proxy port
    const defaultSchema = "public"
    
    // Extract the project reference from the hostname (first part)
    const projectRef = dbName
    
    // Mask the anon key (show first 4 and last 4 chars)
    const maskedKey = supabaseKey.length > 8 
      ? `${supabaseKey.substring(0, 4)}...${supabaseKey.substring(supabaseKey.length - 4)}`
      : "***"
    
    return {
      dbHost: host,
      dbName: dbName,
      maskedDbHost: maskedHost,
      dbPort: port,
      dbUser: `${projectRef}_admin`, // Supabase creates this user
      dbSchema: defaultSchema,
      url: supabaseUrl,
      maskedUrl: `https://${maskedHost}/rest/v1`,
      anonKeyMasked: maskedKey,
      projectRef: projectRef,
    }
  } catch (e) {
    console.error("[v0] Error parsing Supabase URL:", e)
    return {
      dbHost: "UNKNOWN",
      dbName: "UNKNOWN",
      maskedDbHost: "????...????",
      dbPort: "????",
      dbUser: "UNKNOWN",
      dbSchema: "UNKNOWN",
      url: supabaseUrl,
      maskedUrl: "UNKNOWN",
      anonKeyMasked: "???",
      projectRef: "UNKNOWN",
    }
  }
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

export { logDbConnection, getDbDiagnostics }
