import type { Metadata } from "next"
import { supabaseServer } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"
import ResponseForm from "@/components/ResponseForm"
import { notFound } from "next/navigation"

type Survey = Database["public"]["Tables"]["surveys"]["Row"]

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const survey = await getSurvey(params.id)

  if (!survey) {
    return {
      title: "Survey Not Found",
    }
  }

  const frameMetadata = {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/og.png`,
      button: {
        title: "Respond",
        action: {
          type: "launch_frame",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/respond/${params.id}?miniApp=true`,
          name: "Audioform",
          splashImageUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
          splashBackgroundColor: "#000",
        },
      },
    }),
  }

  return {
    title: `${survey.title} - Audioform`,
    description: survey.description || "Share your voice",
    openGraph: {
      title: survey.title,
      description: survey.description || "Share your voice",
      images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og.png`],
    },
    other: frameMetadata,
  }
}

async function getSurvey(id: string): Promise<Survey | null> {
  try {
    const { data: survey, error } = await supabaseServer
      .from("surveys")
      .select("id, title, description, questions, is_active, expires_at, created_at")
      .eq("id", id)
      .single()

    if (error || !survey) {
      return null
    }

    return survey
  } catch (error) {
    console.error("Survey fetch error:", error)
    return null
  }
}

export default async function RespondPage({ params }: Props) {
  const survey = await getSurvey(params.id)

  if (!survey) {
    return notFound()
  }

  // Check if survey is active and not expired
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

  if (survey.expires_at && new Date(survey.expires_at) < new Date()) {
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

  // Get the first question for single-question display
  const questions = Array.isArray(survey.questions) ? survey.questions : []
  const firstQuestion = questions[0]
  const questionText = typeof firstQuestion === "string" ? firstQuestion : firstQuestion?.text || firstQuestion?.prompt

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-600">{survey.description}</p>}
          </div>

          {/* Response Form */}
          <ResponseForm
            surveyId={survey.id}
            question={questionText}
            onComplete={() => {
              // Handle completion - could redirect or show thank you
              window.location.href = "/"
            }}
          />
        </div>
      </div>
    </div>
  )
}
