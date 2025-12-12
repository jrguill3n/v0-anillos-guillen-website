"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AdminDebugPanelProps {
  rings: any[]
}

export function AdminDebugPanel({ rings }: AdminDebugPanelProps) {
  const router = useRouter()

  const latestUpdated = rings.reduce((latest, ring) => {
    const updated = new Date(ring.updated_at || ring.created_at).getTime()
    return updated > latest ? updated : latest
  }, 0)

  const dbInfo = {
    host: typeof window === "undefined" ? process.env.SUPABASE_URL?.split("//")[1]?.split(".")[0] : "client-side",
    hasUrl: typeof window === "undefined" ? !!process.env.SUPABASE_URL : "N/A",
    hasKey: typeof window === "undefined" ? !!process.env.SUPABASE_ANON_KEY : "N/A",
  }

  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>🔍 Debug Panel</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              router.refresh()
            }}
          >
            Hard Refresh Data
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>Rings Count:</strong> {rings.length}
        </div>
        <div>
          <strong>Latest Updated:</strong> {latestUpdated ? new Date(latestUpdated).toISOString() : "N/A"}
        </div>
        <div>
          <strong>DB Host:</strong> {dbInfo.host}
        </div>
        <div>
          <strong>Env Check:</strong> URL={String(dbInfo.hasUrl)}, Key={String(dbInfo.hasKey)}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Note: Set ENABLE_DEBUG_UI=true in environment variables to see this panel
        </div>
      </CardContent>
    </Card>
  )
}
