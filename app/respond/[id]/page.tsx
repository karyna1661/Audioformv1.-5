"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { RecordButton } from "@/components/audio/record-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { ThankYouModal } from "@/components/survey/thank-you-modal"
import { ShareButton } from "@/components/survey/share-button"
import { supabaseBrowser } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { generateSurveyOGMeta } from "@/utils/og-meta"
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
  const [isPlaying, setIsPlaying] = useState(false)
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

  const handleRecordingComplete = (blob: Blob, url: string) => {
    setAudioBlob(blob)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Survey not found</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  const ogMeta = generateSurveyOGMeta(survey.title, surveyId)

  return (
    <>
      <Head>
        <title>{ogMeta.title}</title>
        <meta name="description" content={ogMeta.description} />
        <meta property="og:title" content={ogMeta.openGraph.title} />
        <meta property="og:description" content={ogMeta.openGraph.description} />
        <meta property="og:url" content={ogMeta.openGraph.url} />
        <meta property="og:image" content={ogMeta.openGraph.images[0].url} />
        <meta property="og:type" content={ogMeta.openGraph.type} />
        <meta name="twitter:card" content={ogMeta.twitter.card} />
        <meta name="twitter:title" content={ogMeta.twitter.title} />
        <meta name="twitter:description" content={ogMeta.twitter.description} />
        <meta name="twitter:image" content={ogMeta.twitter.images[0]} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-8 pb-16">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-600 text-sm sm:text-base">{survey.description}</p>}
          </div>

          {/* Main Survey Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-center">{survey.prompt}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Recording Section */}
              <div className="text-center space-y-4">
                <RecordButton
                  onRecordingComplete={handleRecordingComplete}
                  disabled={submitting || hasSubmitted}
                  isRecording={isRecording}
                  onRecordingStart={() => setIsRecording(true)}
                />

                {isRecording && (
                  <p className="text-sm text-blue-600 animate-pulse">Recording... Speak clearly into your microphone</p>
                )}
              </div>

              {/* Audio Playback */}
              {audioUrl && !isRecording && (
                <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <PlayPauseButton
                    audioUrl={audioUrl}
                    isPlaying={isPlaying}
                    onPlayStateChange={setIsPlaying}
                    disabled={submitting}
                  />
                  <span className="text-sm text-gray-600">Preview your response</span>
                </div>
              )}

              {/* Submit Button */}
              {audioBlob && !hasSubmitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || isRecording}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Response...
                    </>
                  ) : (
                    "Submit Response"
                  )}
                </Button>
              )}

              {/* Share Section */}
              <div className="border-t pt-6">
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-gray-700">Share this survey with others:</p>
                  <ShareButton shareUrl={shareUrl} surveyTitle={survey.title} size="sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thank You Modal */}
          <ThankYouModal
            isOpen={showThankYou}
            onClose={() => setShowThankYou(false)}
            surveyTitle={survey.title}
            shareUrl={shareUrl}
          />
        </div>
      </div>
    </>
  )
}
