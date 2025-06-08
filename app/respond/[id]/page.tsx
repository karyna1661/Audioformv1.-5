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
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Survey {
  id: string
  title: string
  description?: string
  questions: any[]
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

  // Multi-question state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())

  const supabase = createClient()
  const surveyId = params.id as string

  useEffect(() => {
    console.log("SurveyResponsePage mounted, fetching survey:", surveyId)
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    console.log("Fetching survey data for ID:", surveyId)
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
        console.error("No survey found with ID:", surveyId)
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

      console.log("Survey loaded successfully:", data)
      setSurvey(data)
    } catch (err) {
      console.error("Unexpected error fetching survey:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async (audioUrl: string) => {
    if (!survey) return

    const currentQuestion = survey.questions[currentIndex]
    const questionId = currentQuestion?.id || `q${currentIndex}`

    // Update responses
    const updated = { ...responses, [questionId]: audioUrl }
    setResponses(updated)

    // Mark current question as completed
    const newCompleted = new Set(completedQuestions)
    newCompleted.add(currentIndex)
    setCompletedQuestions(newCompleted)

    if (currentIndex < survey.questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1)
      toast.success(`Question ${currentIndex + 1} completed!`)
    } else {
      // All questions completed, submit final response
      await handleFinalSubmit(updated)
    }
  }

  const handleFinalSubmit = async (allResponses: Record<string, string>) => {
    setIsSubmitting(true)

    try {
      console.log("Submitting final survey response:", allResponses)

      const { data, error } = await supabase.from("responses").insert([
        {
          survey_id: surveyId,
          user_id: null, // Anonymous for now
          answers: allResponses,
          email: email || null,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      console.log("Survey response submitted successfully:", data)
      toast.success("All responses submitted successfully!")
      setShowThankYou(true)
    } catch (err: any) {
      console.error("Error submitting final response:", err)
      toast.error("Failed to submit your responses. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < (survey?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1)
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

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>Survey Not Found</CardTitle>
            <CardDescription>We couldn't find the survey you're looking for.</CardDescription>
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

  // Get current question
  const currentQuestion = survey.questions[currentIndex]
  const questionText =
    typeof currentQuestion === "string"
      ? currentQuestion
      : currentQuestion?.text || currentQuestion?.prompt || currentQuestion || survey.title

  const progress = ((currentIndex + 1) / survey.questions.length) * 100
  const isLastQuestion = currentIndex === survey.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {survey.questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {survey.description && <p className="text-gray-600 text-center">{survey.description}</p>}
          </div>

          {/* Question Overview */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {survey.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentIndex
                      ? "bg-indigo-600 text-white"
                      : completedQuestions.has(index)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {completedQuestions.has(index) ? <CheckCircle className="w-4 h-4 mx-auto" /> : index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Survey Card */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <CardHeader>
              <CardTitle className="text-xl">
                Question {currentIndex + 1}
                {isLastQuestion && " (Final)"}
              </CardTitle>
              <CardDescription className="text-base font-medium text-gray-800">{questionText}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Recorder */}
              <AudioRecorder
                onSubmit={handleNext}
                isLoading={isSubmitting}
                key={currentIndex} // Reset recorder for each question
              />

              {/* Email Input (only show on first question) */}
              {currentIndex === 0 && (
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

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button onClick={goToPrevious} disabled={currentIndex === 0} variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-gray-500">
                  {completedQuestions.size} of {survey.questions.length} completed
                </span>

                <Button
                  onClick={goToNext}
                  disabled={currentIndex >= survey.questions.length - 1 || !completedQuestions.has(currentIndex)}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
