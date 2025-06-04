"use client"

import { useSearchParams } from "next/navigation"
import { DemoCreateForm } from "@/components/survey/demo-flow/demo-create-form"
import { Header } from "@/components/layout/header"
import { DemoDashboard } from "@/components/survey/demo-flow/demo-dashboard"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { getDemoSessionStatus } from "@/app/actions/demo-sessions"

export default function DemoPage() {
  const params = useSearchParams()
  const demoId = params.get("demoId")
  const [surveyData, setSurveyData] = useState<any>(null)
  const [loading, setLoading] = useState(demoId ? true : false)
  const [error, setError] = useState<string | null>(null)
  const [sessionStatus, setSessionStatus] = useState<any>(null)

  useEffect(() => {
    if (demoId) {
      fetchSurveyData(demoId)
    }
  }, [demoId])

  const fetchSurveyData = async (id: string) => {
    try {
      setLoading(true)

      // Fetch survey data from Supabase
      const { data: survey, error: surveyError } = await supabase.from("surveys").select("*").eq("id", id).single()

      if (surveyError) throw surveyError

      // Fetch responses for this survey
      const { data: responses, error: responsesError } = await supabase
        .from("responses")
        .select("*")
        .eq("survey_id", id)

      if (responsesError) throw responsesError

      // Fetch demo session status
      const sessionData = await getDemoSessionStatus(id)
      setSessionStatus(sessionData)

      // Format the data for the DemoDashboard component
      const formattedData = {
        id: survey.id,
        title: survey.title || "Demo Survey",
        questions: survey.questions || [],
        responses: responses.map((response: any) => ({
          id: response.id,
          questionId: response.question_id,
          audioUrl: getAudioUrl(response.audio_path),
          email: response.email || "anonymous@example.com",
          createdAt: response.created_at,
        })),
        createdAt: survey.created_at,
        expiresAt: survey.expires_at,
      }

      setSurveyData(formattedData)
    } catch (err) {
      console.error("Error fetching survey data:", err)
      setError("Failed to load survey data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getAudioUrl = (path: string) => {
    const { data } = supabase.storage.from("demo-audio").getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {!demoId ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Create a Demo Survey</h1>
              <p className="text-muted-foreground">Try Audioform with a 24-hour demo survey. No account required.</p>
            </div>
            <DemoCreateForm />
          </>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : surveyData ? (
          <DemoDashboard
            surveyId={surveyData.id}
            title={surveyData.title}
            questions={surveyData.questions}
            responses={surveyData.responses}
            createdAt={surveyData.createdAt}
            expiresAt={surveyData.expiresAt}
            sessionStatus={sessionStatus}
          />
        ) : null}
      </main>
    </div>
  )
}
