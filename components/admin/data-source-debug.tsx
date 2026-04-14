import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface DataSourceDebugProps {
  pageType: "admin" | "catalog"
  ringCount: number
  firstCodes?: string[]
  fetchedAt: string
  dbHost?: string
  rowsReturned: number
  onDiagnostic?: () => void
  isDiagnosticLoading?: boolean
}

export function DataSourceDebug({
  pageType,
  ringCount,
  firstCodes = [],
  fetchedAt,
  dbHost = "supabase",
  rowsReturned,
  onDiagnostic,
  isDiagnosticLoading = false,
}: DataSourceDebugProps) {
  const env = process.env.NODE_ENV || "unknown"
  const dbName = process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] || "unknown"

  return (
    <Card className="mb-6 bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm font-mono flex items-center justify-between">
          <span>📊 Data Source Debug</span>
          {onDiagnostic && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDiagnostic}
              disabled={isDiagnosticLoading}
              className="gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              {isDiagnosticLoading ? "Diagnosticando..." : "Diagnosticar"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-600">Page Type:</span>
            <span className="ml-2 font-semibold">{pageType}</span>
          </div>
          <div>
            <span className="text-slate-600">Environment:</span>
            <span className="ml-2 font-semibold">{env}</span>
          </div>
          <div>
            <span className="text-slate-600">DB Host:</span>
            <span className="ml-2 font-semibold">{dbHost}</span>
          </div>
          <div>
            <span className="text-slate-600">DB Name:</span>
            <span className="ml-2 font-semibold">{dbName}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-600">Rows Returned:</span>
            <span className="ml-2 font-semibold text-blue-600">{rowsReturned}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-600">Ring Count:</span>
            <span className="ml-2 font-semibold text-green-600">{ringCount}</span>
          </div>
          {firstCodes.length > 0 && (
            <div className="col-span-2">
              <span className="text-slate-600">First 5 Codes:</span>
              <span className="ml-2 font-semibold text-purple-600">{firstCodes.join(", ")}</span>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-slate-600">Fetched At:</span>
            <span className="ml-2 font-semibold">{fetchedAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
