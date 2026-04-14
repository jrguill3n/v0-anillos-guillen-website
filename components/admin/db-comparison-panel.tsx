"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DbDiagnostics {
  dbHost: string
  dbPort: string
  dbName: string
  dbSchema: string
  projectRef: string
  rowsReturned?: number
  sourceType?: string
}

interface DbComparisonPanelProps {
  readDiagnostics: DbDiagnostics
  writeDiagnostics?: DbDiagnostics
}

export function DbComparisonPanel({ readDiagnostics, writeDiagnostics }: DbComparisonPanelProps) {
  const isMatch = writeDiagnostics && 
    readDiagnostics.dbHost === writeDiagnostics.dbHost &&
    readDiagnostics.dbPort === writeDiagnostics.dbPort &&
    readDiagnostics.dbName === writeDiagnostics.dbName &&
    readDiagnostics.dbSchema === writeDiagnostics.dbSchema &&
    readDiagnostics.projectRef === writeDiagnostics.projectRef

  const matchText = isMatch ? "✅ YES - Read and Write use same DB" : "❌ NO - Different databases!"
  const matchColor = isMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
      <CardHeader>
        <CardTitle className="text-lg">Database Connection Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Match Status */}
        <div className={`p-3 rounded border-2 border-orange-300 dark:border-orange-700 ${matchColor} font-bold text-center`}>
          Read DB matches Write DB: {matchText}
        </div>

        {/* Read DB Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Read DB (Catalog & Admin List):</h3>
          <div className="bg-white dark:bg-slate-900 p-3 rounded text-xs font-mono space-y-1">
            <div>Host: {readDiagnostics.dbHost}:{readDiagnostics.dbPort}</div>
            <div>Name: {readDiagnostics.dbName}</div>
            <div>Schema: {readDiagnostics.dbSchema}</div>
            <div>ProjectRef: {readDiagnostics.projectRef}</div>
            {readDiagnostics.sourceType && <div>Source: {readDiagnostics.sourceType}</div>}
            {readDiagnostics.rowsReturned !== undefined && <div>Rows: {readDiagnostics.rowsReturned}</div>}
          </div>
        </div>

        {/* Write DB Info */}
        {writeDiagnostics && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Write DB (Clear/Delete Operations):</h3>
            <div className="bg-white dark:bg-slate-900 p-3 rounded text-xs font-mono space-y-1">
              <div>Host: {writeDiagnostics.dbHost}:{writeDiagnostics.dbPort}</div>
              <div>Name: {writeDiagnostics.dbName}</div>
              <div>Schema: {writeDiagnostics.dbSchema}</div>
              <div>ProjectRef: {writeDiagnostics.projectRef}</div>
            </div>
          </div>
        )}

        {/* Mismatch Details */}
        {writeDiagnostics && !isMatch && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-300 dark:border-red-700 text-sm">
            <p className="font-bold text-red-700 dark:text-red-300 mb-2">⚠️ DATABASE MISMATCH DETECTED:</p>
            <ul className="text-xs space-y-1 text-red-600 dark:text-red-400">
              {readDiagnostics.dbHost !== writeDiagnostics.dbHost && (
                <li>Host mismatch: {readDiagnostics.dbHost} vs {writeDiagnostics.dbHost}</li>
              )}
              {readDiagnostics.dbPort !== writeDiagnostics.dbPort && (
                <li>Port mismatch: {readDiagnostics.dbPort} vs {writeDiagnostics.dbPort}</li>
              )}
              {readDiagnostics.dbName !== writeDiagnostics.dbName && (
                <li>DB name mismatch: {readDiagnostics.dbName} vs {writeDiagnostics.dbName}</li>
              )}
              {readDiagnostics.dbSchema !== writeDiagnostics.dbSchema && (
                <li>Schema mismatch: {readDiagnostics.dbSchema} vs {writeDiagnostics.dbSchema}</li>
              )}
              {readDiagnostics.projectRef !== writeDiagnostics.projectRef && (
                <li>ProjectRef mismatch: {readDiagnostics.projectRef} vs {writeDiagnostics.projectRef}</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
