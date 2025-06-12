"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, Clock } from "lucide-react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ThankYouModal } from "@/components/ThankYouModal"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Question {
  id: string
  prompt: string
  order: number
}

interface Survey {
  id: string
  title: string
  description?: string
  questions: Question[]
  is_active: boolean
  expires_at?: string
}

export default function SurveyResponsePage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Blob>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const surveyId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    if (surveyId) {
      fetchSurvey()
    }
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching survey:", surveyId)

      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select(`
          id,
          title,
          description,
          is_active,
          expires_at,
          questions (
            id,
            prompt,
            order
          )
        `)
        .eq("id", surveyId.trim())
        .single()

      if (surveyError) {
        console.error("Survey fetch error:", surveyError)
        setError("Survey not found")
        return
      }

      if (!surveyData) {
        setError("Survey not found")
        return
      }

      // Check if survey is active
      if (!surveyData.is_active) {
        setError("This survey is no longer active")
        return
      }

      // Check if survey is expired
      if (surveyData.expires_at && new Date(surveyData.expires_at) < new Date()) {
        setError("This survey has expired")
        return
      }

      // Sort questions by order
      const sortedQuestions = (surveyData.questions || []).sort((a, b) => a.order - b.order)

      setSurvey({
        ...surveyData,
        questions: sortedQuestions,
      })

      console.log("Survey loaded successfully:", surveyData.title)
    } catch (err) {
      console.error("Error fetching survey:", err)
      setError("Failed to load survey")
    } finally {
      setLoading(false)
    }
  }

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (!survey) return

    const currentQuestion = survey.questions[currentQuestionIndex]
    if (!currentQuestion) return

    // Store the response
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: audioBlob,
    }))

    // Move to next question or submit all responses
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      toast.success("Response recorded! Moving to next question.")
    } else {
      // All questions answered, submit responses
      await submitAllResponses({
        ...responses,
        [currentQuestion.id]: audioBlob,
      })
    }
  }

  const submitAllResponses = async (allResponses: Record<string, Blob>) => {
    if (!survey) return

    try {
      setSubmitting(true)

      // Submit each response
      for (const [questionId, audioBlob] of Object.entries(allResponses)) {
        const formData = new FormData()
        formData.append("audio", audioBlob)
        formData.append("surveyId", survey.id)
        formData.append("questionId", questionId)

        const response = await fetch("/api/responses", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to submit response for question ${questionId}`)
        }
      }

      toast.success("All responses submitted successfully!")
      setShowThankYou(true)
    } catch (error) {
      console.error("Error submitting responses:", error)
      toast.error("Failed to submit responses. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading survey...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey Unavailable</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push("/")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!survey) {
    return null
  }

  const currentQuestion = survey.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{survey.title}</h1>
              {survey.description && <p className="text-sm text-gray-600 truncate">{survey.description}</p>}
            </div>
            <div className="w-16"></div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {survey.questions.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {currentQuestion && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{currentQuestion.prompt}</h2>
                <p className="text-gray-600">Record your voice response to this question</p>
              </div>

              <AudioRecorder onSubmit={handleAudioSubmit} isLoading={submitting} />

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="text-sm text-gray-500 flex items-center">
                  {Object.keys(responses).length > 0 && (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      {Object.keys(responses).length} response(s) recorded
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Thank You Modal */}
      {showThankYou && (
        <ThankYouModal
          onClose={() => {
            setShowThankYou(false)
            router.push("/")
          }}
          surveyTitle={survey.title}
          shareUrl={shareUrl}
        />
      )}
    </div>
  )
}
