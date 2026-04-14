"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DbDiagnostics = {
  dbHost: string
  dbPort: string
  dbName: string
  dbSchema: string
  projectRef: string
  maskedDbHost: string
}

export function UnifiedDbDiagnostic() {
  const [readDiag, setReadDiag] = useState<DbDiagnostics | null>(null)
  const [writeDiag, setWriteDiag] = useState<DbDiagnostics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        // Get read diagnostics (from current page render)
        const readUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const readHost = readUrl ? new URL(readUrl).host : "UNKNOWN"
        const readProjectRef = readHost.split(".")[0] || "UNKNOWN"

        setReadDiag({
          dbHost: readHost,
          dbPort: "6543",
          dbName: readProjectRef,
          dbSchema: "public",
          projectRef: readProjectRef,
          maskedDbHost: readHost.length > 8 ? `${readHost.substring(0, 4)}...${readHost.substring(readHost.length - 4)}` : readHost,
        })

        // Get write diagnostics from server action
        const writeResponse = await fetch("/api/db-diagnostics/write")
        if (!writeResponse.ok) throw new Error("Failed to fetch write diagnostics")
        const writeData = await writeResponse.json()

        setWriteDiag(writeData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiagnostics()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="text-base">DB Connection Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading diagnostics...</p>
        </CardContent>
      </Card>
    )
  }

  const hostsMatch = readDiag?.dbHost === writeDiag?.dbHost
  const projectsMatch = readDiag?.projectRef === writeDiag?.projectRef

  return (
    <Card className={`border-2 ${hostsMatch && projectsMatch ? "border-green-300 bg-green-50 dark:bg-green-900/10" : "border-red-300 bg-red-50 dark:bg-red-900/10"}`}>
      <CardHeader>
        <CardTitle className="text-base">
          {hostsMatch && projectsMatch ? "✅ DB Unified" : "❌ DB Mismatch"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 p-3 rounded text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Read DB */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">READ DB</h3>
            <div className="bg-white dark:bg-slate-800 p-3 rounded border font-mono text-xs space-y-1">
              <div>Host: {readDiag?.maskedDbHost}</div>
              <div>Port: {readDiag?.dbPort}</div>
              <div>Name: {readDiag?.dbName}</div>
              <div>ProjectRef: {readDiag?.projectRef}</div>
              <div>Schema: {readDiag?.dbSchema}</div>
            </div>
          </div>

          {/* Write DB */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">WRITE DB</h3>
            <div className="bg-white dark:bg-slate-800 p-3 rounded border font-mono text-xs space-y-1">
              <div>Host: {writeDiag?.maskedDbHost}</div>
              <div>Port: {writeDiag?.dbPort}</div>
              <div>Name: {writeDiag?.dbName}</div>
              <div>ProjectRef: {writeDiag?.projectRef}</div>
              <div>Schema: {writeDiag?.dbSchema}</div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm space-y-1">
          <div className={`${hostsMatch ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
            Hosts Match: {hostsMatch ? "YES ✓" : "NO ✗"}
          </div>
          <div className={`${projectsMatch ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
            ProjectRefs Match: {projectsMatch ? "YES ✓" : "NO ✗"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
