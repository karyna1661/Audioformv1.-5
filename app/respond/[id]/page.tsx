"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { RecordButton } from "@/components/audio/record-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { ThankYouModal } from "@/components/survey/thank-you-modal"
import { ShareButton } from "@/components/survey/share-button"
import { supabaseBrowser } from "@/lib/supabaseClient"
import { toast } from "sonner"
import Head from "next/head"

interface Survey {
  id: string
  title: string
  description?: string
  prompt: string
  created_at: string
  expires_at?: string
}

export default function SurveyResponsePage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"}/respond/${surveyId}`

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabaseBrowser.from("demo_surveys").select("*").eq("id", surveyId).single()

      if (error) throw error

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
      // Upload audio file
      const fileName = `response_${surveyId}_${Date.now()}.webm`
      const { data: uploadData, error: uploadError } = await supabaseBrowser.storage
        .from("audio-responses")
        .upload(fileName, audioBlob, {
          contentType: "audio/webm",
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Save response to database
      const { error: responseError } = await supabaseBrowser.from("survey_responses").insert({
        survey_id: surveyId,
        audio_url: uploadData.path,
        submitted_at: new Date().toISOString(),
      })

      if (responseError) throw responseError

      setHasSubmitted(true)
      setShowThankYou(true)
      toast.success("Response submitted successfully!")
    } catch (error) {
      console.error("Error submitting response:", error)
      toast.error("Failed to submit response. Please try again.")
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

  return (
    <>
      <Head>
        <title>{survey.title} | Voice Survey</title>
        <meta name="description" content={survey.description || survey.prompt} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-sm truncate mx-2 flex-1">{survey.title}</h1>
          <ShareButton surveyId={surveyId} surveyTitle={survey.title} size="sm" />
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-20">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Survey Info Card */}
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl leading-tight">{survey.title}</CardTitle>
                {survey.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{survey.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question Prompt */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-base font-medium text-blue-900 leading-relaxed">{survey.prompt}</p>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Section */}
            {!hasSubmitted && (
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <p className="text-sm font-medium text-gray-700">Share this survey:</p>
                    <ShareButton surveyId={surveyId} surveyTitle={survey.title} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Thank You Modal */}
        <ThankYouModal
          isOpen={showThankYou}
          onClose={() => setShowThankYou(false)}
          surveyTitle={survey.title}
          shareUrl={shareUrl}
        />
      </div>
    </>
  )
}
