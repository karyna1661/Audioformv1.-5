"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Mic } from "lucide-react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { createClient } from "@/utils/supabase/client"
import { ThankYouModal } from "@/components/ThankYouModal"
import { toast } from "sonner"
import Head from "next/head"
import { getSurveyResponseUrl } from "@/utils/url-utils"

interface Survey {
  id: string
  title: string
  questions: any[]
  created_at: string
  expires_at: string
  is_active: boolean
}

export default function RespondPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  const supabase = createClient()

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase.from("surveys").select("*").eq("id", surveyId).single()

      if (error) {
        console.error("Error fetching survey:", error)
        toast.error("Survey not found")
        router.push("/")
        return
      }

      if (!data) {
        toast.error("Survey not found")
        router.push("/")
        return
      }

      // Check if survey has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("This survey has expired")
        router.push("/")
        return
      }

      // Check if survey is active
      if (!data.is_active) {
        toast.error("This survey is no longer active")
        router.push("/")
        return
      }

      setSurvey(data)
    } catch (error) {
      console.error("Error fetching survey:", error)
      toast.error("Failed to load survey")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (audioBlob: Blob) => {
    if (!audioBlob || !survey || submitting) return

    setSubmitting(true)

    try {
      // Upload audio to Supabase Storage (demo-audio bucket)
      const filename = `${surveyId}/${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("demo-audio")
        .upload(filename, audioBlob, {
          contentType: "audio/webm",
        })

      if (uploadError) {
        console.error("Error uploading audio:", uploadError)
        toast.error("Failed to upload audio.")
        setSubmitting(false)
        return
      }

      const audioPath = uploadData.path

      // Store response in database
      const { error: insertError } = await supabase.from("responses").insert({
        survey_id: surveyId,
        question_id: "q1",
        audio_path: audioPath,
        email: email || null,
      })

      if (insertError) {
        console.error("Error inserting response:", insertError)
        toast.error("Failed to save your response.")
        setSubmitting(false)
        return
      }

      setShowThankYou(true)
      toast.success("Response submitted successfully!")
    } catch (error: any) {
      console.error("Error submitting response:", error)
      toast.error(error.message || "Failed to submit response. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          <p className="text-indigo-900 font-medium">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4 bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">!</span>
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
      <Head>
        <title>{survey.title} | Audioform</title>
        <meta name="description" content={questionText} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta property="og:title" content={survey.title} />
        <meta property="og:description" content="Voice your thoughts in seconds" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-sm truncate mx-2 flex-1">{survey.title}</h1>
          <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-20">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Survey Info Card */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl leading-tight">{survey.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question Prompt */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="text-base font-medium text-indigo-900 leading-relaxed">{questionText}</p>
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

            {/* Branding Footer */}
            <div className="text-center">
              <p className="text-xs text-indigo-400">
                Powered by <span className="font-semibold">Audioform</span>
              </p>
            </div>
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
