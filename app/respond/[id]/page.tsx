import type { Metadata } from "next"
import { supabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SurveyResponseClient } from "@/components/survey/survey-response-client"

interface Props {
  params: { id: string }
}

export default async function RespondPage({ params }: Props) {
  const surveyId = params.id.trim()

  try {
    const { data: survey, error } = await supabaseServer
      .from("surveys")
      .select("id, title, description, questions, is_active, created_at, expires_at")
      .eq("id", surveyId)
      .single()

    if (error || !survey) {
      console.error("Survey fetch error:", error)
      return notFound()
    }

    if (!survey.is_active) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Unavailable</h1>
            <p className="text-gray-600 mb-6">This survey is currently not active.</p>
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

    return <SurveyResponseClient survey={survey} />
  } catch (error) {
    console.error("Unexpected error:", error)
    return notFound()
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const surveyId = params.id.trim()

  const { data: survey, error } = await supabaseServer
    .from("surveys")
    .select("id, title, description, questions, is_active, expires_at, created_at")
    .eq("id", surveyId)
    .single()

  if (error || !survey) {
    return {
      title: "Survey Not Found",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"

  return {
    title: `${survey.title} - Audioform`,
    description: survey.description || "Share your voice",
  }
}
