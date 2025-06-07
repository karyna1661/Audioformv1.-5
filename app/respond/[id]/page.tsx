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
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

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
      // Fetch the survey data
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

      // Check if survey has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This survey has expired")
        return
      }

      // Check if survey is active
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

  const handleSubmit = async (audioBlob: Blob) => {
    if (!survey) return

    setIsSubmitting(true)

    try {
      console.log("Submitting audio response for survey:", surveyId)

      // Create form data for the audio upload
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("surveyId", surveyId)
      formData.append("email", email || "")

      // Upload to your API endpoint
      const response = await fetch("/api/responses", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit response")
      }

      toast.success("Response submitted successfully!")
      setShowThankYou(true)
    } catch (err: any) {
      console.error("Error submitting response:", err)
      toast.error(err.message || "Failed to submit your response. Please try again.")
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

  // No survey data
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
  const currentQuestion =
    survey.questions && survey.questions.length > 0
      ? typeof survey.questions[currentQuestionIndex] === "string"
        ? survey.questions[currentQuestionIndex]
        : survey.questions[currentQuestionIndex]?.text || survey.questions[currentQuestionIndex]
      : survey.title

  // Main content - Survey response form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-600">{survey.description}</p>}
          </div>

          {/* Survey Card */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <CardHeader>
              <CardTitle className="text-xl">Question</CardTitle>
              <CardDescription className="text-base font-medium text-gray-800">{currentQuestion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Recorder */}
              <AudioRecorder onSubmit={handleSubmit} isLoading={isSubmitting} />

              {/* Email Input */}
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
            </CardContent>
          </Card>

          {/* Watch Demo Link */}
          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-indigo-600 hover:text-indigo-800"
              onClick={() => toast.info("Demo feature coming soon!")}
            >
              Watch Demo
            </Button>
          </div>
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
