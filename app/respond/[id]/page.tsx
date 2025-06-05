"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import { RecordButton } from "@/components/audio/record-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { supabase } from "@/lib/supabase/client"
import { submitResponse } from "@/lib/actions/submitResponse"
import { toast } from "sonner"
import Head from "next/head"

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

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [email, setEmail] = useState("")
  const [showThankYou, setShowThankYou] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

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

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob)
    const url = URL.createObjectURL(blob)
    setAudioUrl(url)
    setIsRecording(false)
  }

  const handleSubmit = async () => {
    if (!audioBlob || !survey || submitting || hasSubmitted) return

    setSubmitting(true)

    try {
      // Create form data for server action
      const formData = new FormData()
      formData.append("surveyId", surveyId)
      formData.append("questionId", survey.questions[0].id || "1")
      formData.append("audio", audioBlob)
      if (email) formData.append("email", email)

      const result = await submitResponse(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      setHasSubmitted(true)
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Survey not found</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  // Get the question text
  const questionText = survey.questions && survey.questions.length > 0 ? survey.questions[0].text : survey.title

  return (
    <>
      <Head>
        <title>{survey.title} | Voice Survey</title>
        <meta name="description" content={questionText} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-sm truncate mx-2 flex-1">{survey.title}</h1>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-20">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Survey Info Card */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl leading-tight">{survey.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question Prompt */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-base font-medium text-blue-900 leading-relaxed">{questionText}</p>
                </div>

                {/* Recording Section */}
                <div className="text-center space-y-4">
                  <RecordButton
                    onRecordingComplete={handleRecordingComplete}
                    disabled={submitting || hasSubmitted}
                    onRecordingStart={() => setIsRecording(true)}
                    className="w-full max-w-xs mx-auto"
                  />

                  {isRecording && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-red-600 font-medium">Recording...</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Speak clearly into your microphone</p>
                    </div>
                  )}
                </div>

                {/* Audio Playback */}
                {audioUrl && !isRecording && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-center">
                      <PlayPauseButton audioUrl={audioUrl} disabled={submitting} />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Preview your response</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAudioBlob(null)
                        setAudioUrl(null)
                      }}
                      className="w-full"
                      disabled={submitting}
                    >
                      Record Again
                    </Button>
                  </div>
                )}

                {/* Email Input (Optional) */}
                {audioBlob && !hasSubmitted && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Optional: Leave your email to get notified of replies</p>
                    <Input
                      type="email"
                      placeholder="your@email.com (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      className="mb-4"
                    />
                  </div>
                )}

                {/* Submit Button */}
                {audioBlob && !hasSubmitted && (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || isRecording}
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Response"
                    )}
                  </Button>
                )}

                {hasSubmitted && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">Response submitted successfully!</p>
                    <p className="text-sm text-green-600 mt-1">Thank you for sharing your thoughts.</p>
                    <Button onClick={() => router.push("/")} className="mt-4 bg-green-600 hover:bg-green-700" size="sm">
                      Return Home
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
