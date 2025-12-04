"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ImportPage() {
  const [isImporting, setIsImporting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const handleImport = async () => {
    setIsImporting(true)
    setLogs([])
    setCompleted(false)
    addLog("Starting import from WordPress...")

    try {
      const response = await fetch("/api/admin/import-wordpress", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter(Boolean)

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6))
              if (data.log) {
                addLog(data.log)
              }
              if (data.completed) {
                setCompleted(true)
                addLog("Import completed successfully!")
              }
            }
          }
        }
      }
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Import Catalog from WordPress</CardTitle>
          <CardDescription>
            This will fetch all rings from anillosguillen.com/catalogo/ and import them into the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleImport} disabled={isImporting} size="lg" className="w-full">
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isImporting ? "Importing..." : "Start Import"}
          </Button>

          {logs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Import Log:</h3>
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-sm space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed && (
            <div className="bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 p-4 rounded-lg">
              ✅ Import completed! Check the catalog page to see the imported rings.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
