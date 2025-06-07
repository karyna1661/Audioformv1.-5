"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ThankYouModal } from "@/components/ThankYouModal"
import { Footer } from "@/components/layout/footer"
import { surveyService } from "@/lib/services/survey-service"
import { SurveyDatabaseError } from "@/lib/database/error-handler"
import type { Survey } from "@/lib/services/survey-service"
import { toast } from "sonner"

interface ResponseState {
  [questionId: string]: {
    audioBlob: Blob
    submitted: boolean
    submitting: boolean
    error?: string
  }
}

export default function SurveyResponsePage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<ResponseState>({})
  const [email, setEmail] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)
  const [responseCount, setResponseCount] = useState(0)

  const surveyId = params.id as string

  useEffect(() => {
    if (surveyId) {
      fetchSurvey()
      fetchResponseCount()
    }
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      setLoading(true)
      setError(null)
      setErrorCode(null)

      console.log("Fetching survey:", surveyId)

      const surveyData = await surveyService.getSurveyById(surveyId)
      setSurvey(surveyData)

      console.log("Survey loaded successfully:", surveyData.title)
    } catch (err) {
      console.error("Error fetching survey:", err)

      if (err instanceof SurveyDatabaseError) {
        setError(err.message)
        setErrorCode(err.code)
      } else {
        setError("Failed to load survey. Please try again.")
        setErrorCode("UNKNOWN_ERROR")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchResponseCount = async () => {
    try {
      const count = await surveyService.getResponseCount(surveyId)
      setResponseCount(count)
    } catch (err) {
      console.warn("Error fetching response count:", err)
    }
  }

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (!survey) return

    const currentQuestion = survey.questions[currentQuestionIndex]
    if (!currentQuestion) return

    // Update response state to show submitting
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        audioBlob,
        submitted: false,
        submitting: true,
      },
    }))

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("surveyId", survey.id)
      formData.append("questionId", currentQuestion.id)
      if (email.trim()) {
        formData.append("email", email.trim())
      }

      const response = await fetch("/api/responses", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit response")
      }

      // Update response state to show success
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          audioBlob,
          submitted: true,
          submitting: false,
        },
      }))

      toast.success("Response recorded successfully!")

      // Move to next question or show completion
      if (currentQuestionIndex < survey.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        // All questions completed
        setShowThankYou(true)
        await fetchResponseCount() // Update response count
      }
    } catch (error: any) {
      console.error("Error submitting response:", error)

      // Update response state to show error
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          audioBlob,
          submitted: false,
          submitting: false,
          error: error.message,
        },
      }))

      toast.error(error.message || "Failed to submit response. Please try again.")
    }
  }

  const retrySubmission = async (questionId: string) => {
    const response = responses[questionId]
    if (!response || !response.audioBlob) return

    const question = survey?.questions.find((q) => q.id === questionId)
    if (!question) return

    // Find question index and set as current
    const questionIndex = survey.questions.findIndex((q) => q.id === questionId)
    if (questionIndex !== -1) {
      setCurrentQuestionIndex(questionIndex)
      await handleAudioSubmit(response.audioBlob)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (survey?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">{getErrorTitle(errorCode)}</h2>

          <p className="text-gray-600 mb-6">{error}</p>

          <div className="space-y-3">
            {errorCode !== "SURVEY_EXPIRED" && errorCode !== "SURVEY_INACTIVE" && (
              <Button onClick={fetchSurvey} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Try Again
              </Button>
            )}

            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
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
  const completedResponses = Object.values(responses).filter((r) => r.submitted).length

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

            <div className="text-sm text-gray-600">{responseCount} responses</div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {survey.questions.length}
              </span>
              <span>{completedResponses} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
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

              {/* Show current response status */}
              {responses[currentQuestion.id] && (
                <div className="mb-6 p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Status:</span>
                    <div className="flex items-center space-x-2">
                      {responses[currentQuestion.id].submitting && (
                        <>
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-indigo-600">Submitting...</span>
                        </>
                      )}
                      {responses[currentQuestion.id].submitted && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Submitted</span>
                        </>
                      )}
                      {responses[currentQuestion.id].error && (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">Failed</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retrySubmission(currentQuestion.id)}
                            className="ml-2"
                          >
                            Retry
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {responses[currentQuestion.id].error && (
                    <p className="text-sm text-red-600 mt-2">{responses[currentQuestion.id].error}</p>
                  )}
                </div>
              )}

              <AudioRecorder
                onSubmit={handleAudioSubmit}
                isLoading={responses[currentQuestion.id]?.submitting || false}
                disabled={responses[currentQuestion.id]?.submitted || false}
              />

              {/* Email Input (only show on first question) */}
              {currentQuestionIndex === 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get notified when others respond</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {completedResponses} of {survey.questions.length} completed
                </div>

                <Button
                  variant="outline"
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex >= survey.questions.length - 1}
                >
                  Next
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Question Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium text-gray-900 mb-3">Question Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {survey.questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-2 text-left rounded-md text-sm transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                      : responses[question.id]?.submitted
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : responses[question.id]?.error
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Q{index + 1}</span>
                    {responses[question.id]?.submitted && <CheckCircle className="w-3 h-3 text-green-500" />}
                    {responses[question.id]?.error && <XCircle className="w-3 h-3 text-red-500" />}
                  </div>
                  <p className="truncate text-xs mt-1">{question.prompt}</p>
                </button>
              ))}
            </div>
          </div>
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
          shareUrl={typeof window !== "undefined" ? window.location.href : ""}
        />
      )}
    </div>
  )
}

function getErrorTitle(errorCode: string | null): string {
  switch (errorCode) {
    case "NOT_FOUND":
      return "Survey Not Found"
    case "SURVEY_EXPIRED":
      return "Survey Expired"
    case "SURVEY_INACTIVE":
      return "Survey Inactive"
    case "INVALID_SURVEY_ID":
      return "Invalid Survey"
    default:
      return "Unable to Load Survey"
  }
}
