"use client"

import { useParams } from "next/navigation"
import { SurveyDebug } from "@/components/debug/survey-debug"

export default function DebugSurveyPage() {
  const params = useParams()
  const surveyId = params.id as string

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Survey Debug Page</h1>
      <p className="mb-4">Debugging survey with ID: {surveyId}</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Survey Data</h2>
        <SurveyDebug surveyId={surveyId} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(
            {
              NODE_ENV: process.env.NODE_ENV,
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  )
}
