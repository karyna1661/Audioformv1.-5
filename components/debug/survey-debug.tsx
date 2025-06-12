"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface DebugInfo {
  supabaseConnection: boolean
  surveyExists: boolean
  surveyData: any
  error: string | null
}

export function SurveyDebug({ surveyId }: { surveyId: string }) {
  const [debug, setDebug] = useState<DebugInfo>({
    supabaseConnection: false,
    surveyExists: false,
    surveyData: null,
    error: null,
  })
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Test Supabase connection
      const { data: connectionTest, error: connectionError } = await supabase.from("surveys").select("count").limit(1)

      if (connectionError) {
        setDebug((prev) => ({
          ...prev,
          supabaseConnection: false,
          error: `Connection error: ${connectionError.message}`,
        }))
        setLoading(false)
        return
      }

      // Test survey fetch
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single()

      setDebug({
        supabaseConnection: true,
        surveyExists: !!surveyData && !surveyError,
        surveyData: surveyData || surveyError,
        error: surveyError?.message || null,
      })
    } catch (err: any) {
      setDebug((prev) => ({
        ...prev,
        error: `Unexpected error: ${err.message}`,
      }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [surveyId])

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-yellow-800 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Supabase Connection:</span>
          {debug.supabaseConnection ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>Survey Exists:</span>
          {debug.surveyExists ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>

        <div>
          <span className="font-medium">Survey ID:</span>
          <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{surveyId}</code>
        </div>

        {debug.error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <span className="font-medium text-red-800">Error:</span>
            <p className="text-red-700 text-xs mt-1">{debug.error}</p>
          </div>
        )}

        {debug.surveyData && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">Survey Data</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(debug.surveyData, null, 2)}
            </pre>
          </details>
        )}

        <Button onClick={runDiagnostics} disabled={loading} size="sm" variant="outline" className="w-full">
          {loading ? "Running..." : "Run Diagnostics"}
        </Button>
      </CardContent>
    </Card>
  )
}
