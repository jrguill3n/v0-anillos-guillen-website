import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      )
    }

    const url = new URL(supabaseUrl)
    const host = url.host
    const projectRef = host.split(".")[0] || "UNKNOWN"
    const maskedHost = host.length > 8 ? `${host.substring(0, 4)}...${host.substring(host.length - 4)}` : host

    return NextResponse.json({
      dbHost: host,
      dbPort: "6543",
      dbName: projectRef,
      dbSchema: "public",
      projectRef: projectRef,
      maskedDbHost: maskedHost,
    })
  } catch (error) {
    console.error("[v0] Error getting write diagnostics:", error)
    return NextResponse.json(
      { error: "Failed to get diagnostics" },
      { status: 500 }
    )
  }
}
