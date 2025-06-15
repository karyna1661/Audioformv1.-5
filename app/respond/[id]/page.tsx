"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { SurveyStats } from "@/components/survey/survey-stats"
import { QuestionCard } from "@/components/survey/question-card"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"] & {
  responses: Database["public"]["Tables"]["responses"]["Row"][]
}

const supabase = createClientComponentClient<Database>()

interface Props {
  params: { id: string }
}

export default function RespondPage({ params: { id } }: Props) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSurvey() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("surveys")
          .select(`
            *,
            responses(*)
          `)
          .eq("id", id)
          .single()

        if (error || !data) {
          throw error || new Error("Survey not found")
        }

        // Check if survey is active
        if (!data.is_active) {
          setError("This survey is no longer active")
          return
        }

        // Check if survey is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This survey has expired")
          return
        }

        setSurvey(data as Survey)

        // Parse questions - handle both string and object formats
        const parsedQuestions = Array.isArray(data.questions)
          ? data.questions
          : typeof data.questions === "string"
            ? [data.questions]
            : [data.questions]

        setQuestions(parsedQuestions)
      } catch (err) {
        console.error("Survey load error:", err)
        setError("Survey not found or expired")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadSurvey()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        {/* Survey Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

          {/* Survey Stats - show response count */}
          <SurveyStats surveyId={id} responseCount={survey.responses?.length || 0} />
        </div>

        {/* Question Navigation */}
        <QuestionCard
          question={questions[currentIndex]}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          surveyId={id}
          onNext={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
          onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          isFirst={currentIndex === 0}
          isLast={currentIndex === questions.length - 1}
          onComplete={() => {
            // Handle survey completion
            router.push("/")
          }}
        />
      </div>
    </div>
  )
}
