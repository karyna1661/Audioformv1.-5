"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ThankYouModal } from "@/components/ThankYouModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle, Clock, Users, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { useSurveyStore } from "@/lib/stores/survey-store"
import { useSurveyMetrics } from "@/hooks/use-survey-metrics"

interface Question {
  id: string
  prompt: string
  type?: string
}

interface Survey {
  id: string
  title: string
  description?: string
  questions: Question[]
  created_at: string
  expires_at?: string
  is_active: boolean
}

export default function SurveyResponsePage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  const supabase = createClient()
  const surveyId = params.id as string

  // Survey store
  const { initializeSurvey, navigateToQuestion, addResponse, markSurveyComplete, getCurrentSurvey, getSurveyProgress } =
    useSurveyStore()

  const surveyProgress = getSurveyProgress(surveyId)
  const currentQuestionIndex = surveyProgress?.currentQuestionIndex || 0
  const responses = surveyProgress?.responses || []

  // Survey metrics
  const { responseCount, averageTime, completionRate, isLoading: metricsLoading } = useSurveyMetrics(surveyId)

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("surveys").select("*").eq("id", surveyId).single()

      if (error) {
        console.error("Error fetching survey:", error)
        setError("Failed to load survey. Please check the URL and try again.")
        return
      }

      if (!data) {
        setError("Survey not found")
        return
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This survey has expired")
        return
      }

      if (!data.is_active) {
        setError("This survey is no longer active")
        return
      }

      setSurvey(data)

      // Initialize survey in store if not already done
      if (!surveyProgress) {
        initializeSurvey(surveyId, data.questions.length)
      }
    } catch (err) {
      console.error("Unexpected error fetching survey:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAudioResponse = (audioUrl: string, duration: number) => {
    if (!survey) return

    const currentQuestion = survey.questions[currentQuestionIndex]
    if (!currentQuestion) return

    const response = {
      questionId: currentQuestion.id,
      audioUrl,
      duration,
      timestamp: new Date(),
    }

    addResponse(surveyId, response)
    toast.success("Response saved!")
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(surveyId, currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < (survey?.questions.length || 0) - 1) {
      navigateToQuestion(surveyId, currentQuestionIndex + 1)
    }
  }

  const handleSubmitAll = async () => {
    if (!survey || !surveyProgress) return

    setIsSubmitting(true)

    try {
      // Submit all responses to database
      const submissionData = {
        survey_id: surveyId,
        user_email: email || null,
        responses: surveyProgress.responses,
        completed_at: new Date().toISOString(),
        total_duration: surveyProgress.responses.reduce((total, r) => total + r.duration, 0),
      }

      const { data, error } = await supabase.from("survey_submissions").insert([submissionData]).select().single()

      if (error) throw error

      // Mark survey as complete
      markSurveyComplete(surveyId)

      toast.success("Survey submitted successfully!")
      setShowThankYou(true)
    } catch (err: any) {
      console.error("Error submitting survey:", err)
      toast.error("Failed to submit survey. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle>Unable to Load Survey</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) return null

  const currentQuestion = survey.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1
  const hasAllResponses = responses.length === survey.questions.length
  const currentResponse = responses.find((r) => r.questionId === currentQuestion?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Survey Header with Metrics */}
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{survey.title}</CardTitle>
                  {survey.description && <CardDescription className="mt-2">{survey.description}</CardDescription>}
                </div>

                {/* Metrics Display */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{responseCount} responses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{averageTime}s avg</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{completionRate}% complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Question {currentQuestionIndex + 1} of {survey.questions.length}
                  </span>
                  <span>{responses.length} answered</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question Navigation */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {survey.questions.map((_, index) => {
                  const hasResponse = responses.some((r) => r.questionId === survey.questions[index].id)
                  return (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(surveyId, index)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? "bg-indigo-600 text-white"
                          : hasResponse
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {hasResponse ? <CheckCircle className="w-4 h-4 mx-auto" /> : index + 1}
                    </button>
                  )
                })}
              </div>
            </CardHeader>
          </Card>

          {/* Current Question */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Question {currentQuestionIndex + 1}
                  {isLastQuestion && " (Final)"}
                </CardTitle>
                {currentResponse && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Answered
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base font-medium text-gray-800">
                {currentQuestion?.prompt}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Audio Recorder */}
              <AudioRecorder
                onSubmit={handleAudioResponse}
                isLoading={isSubmitting}
                questionId={currentQuestion?.id}
                existingResponse={
                  currentResponse
                    ? {
                        audioUrl: currentResponse.audioUrl,
                        duration: currentResponse.duration,
                      }
                    : undefined
                }
              />

              {/* Email Input (only show on first question) */}
              {currentQuestionIndex === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Provide your email to get notified when others respond</p>
                </div>
              )}

              {/* Navigation - Properly centered */}
              <div className="flex justify-center items-center pt-4">
                <div className="flex justify-between items-center w-full max-w-md">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-500 px-4">
                    {responses.length} of {survey.questions.length} completed
                  </span>

                  {isLastQuestion && hasAllResponses ? (
                    <Button
                      onClick={handleSubmitAll}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Survey"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={currentQuestionIndex >= survey.questions.length - 1 || isSubmitting}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <ThankYouModal
          onClose={() => router.push("/")}
          surveyTitle={survey.title}
          shareUrl={typeof window !== "undefined" ? window.location.href : ""}
        />
      )}
    </div>
  )
}
