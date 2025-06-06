"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { AudioRecorder } from "@/components/AudioRecorder"
import { useRouter } from "next/navigation"
import { ThankYouModal } from "@/components/ThankYouModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, AlertCircle, Mic, Users, Clock } from "lucide-react"
import { toast } from "sonner"
import { getSurveyResponseUrl } from "@/utils/url-utils"

interface Survey {
  id: string
  title: string
  questions: any[]
  created_at: string
  expires_at: string
  is_active: boolean
  description?: string
}

interface SurveyResponsePageProps {
  params: { id: string }
}

export default function SurveyResponsePage({ params }: SurveyResponsePageProps) {
  const supabase = createClient()
  const router = useRouter()
  const surveyId = params.id?.trim()

  // State management
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)
  const [responseCount, setResponseCount] = useState(0)

  // Debug logging
  useEffect(() => {
    console.log("SurveyResponsePage mounted with params:", params)
    console.log("Survey ID:", surveyId)

    if (!surveyId) {
      console.error("No survey ID provided")
      setError("Invalid survey URL")
      setLoading(false)
      return
    }

    fetchSurvey()
    fetchResponseCount()
  }, [surveyId])

  const fetchSurvey = async () => {
    if (!surveyId) {
      setError("Invalid survey ID")
      setLoading(false)
      return
    }

    try {
      console.log("Fetching survey with ID:", surveyId)

      const { data, error: fetchError } = await supabase.from("surveys").select("*").eq("id", surveyId).single()

      console.log("Survey fetch result:", { data, error: fetchError })

      if (fetchError) {
        console.error("Supabase error:", fetchError)
        if (fetchError.code === "PGRST116") {
          setError("Survey not found")
        } else {
          setError(`Database error: ${fetchError.message}`)
        }
        setLoading(false)
        return
      }

      if (!data) {
        console.error("No survey data returned")
        setError("Survey not found")
        setLoading(false)
        return
      }

      // Check if survey has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        console.log("Survey has expired:", data.expires_at)
        setError("This survey has expired")
        setLoading(false)
        return
      }

      // Check if survey is active
      if (!data.is_active) {
        console.log("Survey is not active")
        setError("This survey is no longer active")
        setLoading(false)
        return
      }

      console.log("Survey loaded successfully:", data)
      setSurvey(data)
      setError(null)
    } catch (err) {
      console.error("Unexpected error fetching survey:", err)
      setError("Failed to load survey. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchResponseCount = async () => {
    if (!surveyId) return

    try {
      const { count, error } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", surveyId)

      if (!error && count !== null) {
        setResponseCount(count)
      }
    } catch (err) {
      console.error("Error fetching response count:", err)
    }
  }

  const handleSubmit = async (audioBlob: Blob) => {
    if (!audioBlob || !survey || submitting) {
      console.error("Invalid submission state:", { audioBlob: !!audioBlob, survey: !!survey, submitting })
      return
    }

    setSubmitting(true)
    console.log("Starting audio submission...")

    try {
      // Upload audio to Supabase Storage
      const filename = `${surveyId}/${Date.now()}.webm`
      console.log("Uploading audio file:", filename)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("demo-audio")
        .upload(filename, audioBlob, {
          contentType: "audio/webm",
        })

      if (uploadError) {
        console.error("Error uploading audio:", uploadError)
        toast.error("Failed to upload audio. Please try again.")
        setSubmitting(false)
        return
      }

      console.log("Audio uploaded successfully:", uploadData)

      // Store response in database
      const responseData = {
        survey_id: surveyId,
        question_id: "q1",
        audio_path: uploadData.path,
        email: email || null,
      }

      console.log("Saving response to database:", responseData)

      const { error: insertError } = await supabase.from("responses").insert(responseData)

      if (insertError) {
        console.error("Error inserting response:", insertError)
        toast.error("Failed to save your response. Please try again.")
        setSubmitting(false)
        return
      }

      console.log("Response saved successfully")
      setShowThankYou(true)
      toast.success("Response submitted successfully!")

      // Update response count
      setResponseCount((prev) => prev + 1)
    } catch (error: any) {
      console.error("Error submitting response:", error)
      toast.error(error.message || "Failed to submit response. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          <p className="text-indigo-900 font-medium">Loading survey...</p>
          <p className="text-sm text-gray-600">Survey ID: {surveyId}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4 bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Unable to Load Survey</h2>
          <p className="text-gray-600">{error}</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Survey ID: {surveyId}</p>
            <p>URL: {window.location.href}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Survey not found
  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4 bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900">Survey not found</p>
          <p className="text-gray-600">This survey may have been deleted or has expired.</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  // Get the question text
  const questionText =
    survey.questions && survey.questions.length > 0
      ? typeof survey.questions[0] === "string"
        ? survey.questions[0]
        : survey.questions[0].text || survey.questions[0]
      : survey.title

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-indigo-600 hover:bg-indigo-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{responseCount} responses</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>~2 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Survey Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              <Mic className="h-3 w-3 mr-1" />
              Voice Survey
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {survey.title}
            </h1>

            {survey.description && (
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">{survey.description}</p>
            )}
          </div>

          {/* Recording Interface */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
                Share Your Voice
              </CardTitle>
              <p className="text-gray-600 text-center">Record your response to this survey question</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question Prompt */}
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <p className="text-base font-medium text-indigo-900 leading-relaxed text-center">{questionText}</p>
              </div>

              {/* Recording Section */}
              <AudioRecorder onSubmit={handleSubmit} isLoading={submitting} />

              {/* Email Input (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Optional: Leave your email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="border-indigo-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <p className="text-xs text-gray-500">Get notified when others respond</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Your response will be anonymous and help improve our understanding</p>
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <ThankYouModal
          onClose={() => router.push("/")}
          surveyTitle={survey.title}
          shareUrl={getSurveyResponseUrl(surveyId)}
        />
      )}
    </>
  )
}
