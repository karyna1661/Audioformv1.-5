"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface DebugProps {
  surveyId: string
}

export function SurveyDebug({ surveyId }: DebugProps) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        console.log("Debug: Fetching survey with ID:", surveyId)

        const { data, error } = await supabase.from("surveys").select("*").eq("id", surveyId).single()

        if (error) {
          console.error("Debug: Error fetching survey:", error)
          setError(error.message)
          return
        }

        console.log("Debug: Survey data:", data)
        setData(data)
      } catch (err: any) {
        console.error("Debug: Unexpected error:", err)
        setError(err.message || "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [surveyId])

  if (isLoading) {
    return <div className="p-4 bg-blue-50 rounded">Loading debug data...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded border border-red-200">
        <h3 className="font-bold text-red-700">Debug Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-50 rounded border border-green-200">
      <h3 className="font-bold text-green-700">Debug Info</h3>
      <p className="text-green-600">Survey found: {data?.title || "Unknown"}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-green-700">View raw data</summary>
        <pre className="mt-2 p-2 bg-black text-green-400 rounded text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}
