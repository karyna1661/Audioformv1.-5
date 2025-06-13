import { supabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import SurveyResponseClient from "@/components/survey/survey-response-client"

export default async function SurveyResponsePage({ params }: { params: { id: string } }) {
  const surveyId = params.id.trim()

  // Fetch survey data server-side
  const { data: survey, error } = await supabaseServer
    .from("surveys")
    .select("id, title, questions, expires_at, created_at")
    .eq("id", surveyId)
    .single()

  if (error || !survey) {
    console.error("Error fetching survey:", error)
    return notFound()
  }

  // Check if survey has expired
  const isExpired = survey.expires_at && new Date(survey.expires_at) < new Date()

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Expired</h1>
          <p className="text-gray-600 mb-6">This survey is no longer accepting responses.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  // Pass survey data to client component
  return <SurveyResponseClient survey={survey} />
}
