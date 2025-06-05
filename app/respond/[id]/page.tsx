"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { AudioRecorder } from "@/components/AudioRecorder"
import { useRouter } from "next/navigation"
import { ThankYouModal } from "@/components/ThankYouModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Survey {
  id: string
  title: string
  questions: any[]
  created_at: string
  expires_at: string
  is_active: boolean
}

export default function SubmitResponsePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loadingSurvey, setLoadingSurvey] = useState(true)

  useEffect(() => {
    fetchSurvey()
  }, [params.id])

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase.from("surveys").select("*").eq("id", params.id).single()

      if (error || !data) {
        console.error("Error fetching survey:", error)
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
      setLoadingSurvey(false)
    }
  }

  const handleSubmit = async (audioBlob: Blob) => {
    setIsLoading(true)
    try {
      const surveyId = params.id

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
        setIsLoading(false)
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
        setIsLoading(false)
        return
      }

      // Show thank you modal
      setShowThankYou(true)
      toast.success("Response submitted successfully!")
    } catch (err) {
      console.error("Unexpected error:", err)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingSurvey) {
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
        </div>
      </div>
    )
  }

  const questionText =
    survey.questions && survey.questions.length > 0
      ? typeof survey.questions[0] === "string"
        ? survey.questions[0]
        : survey.questions[0].text || survey.questions[0]
      : survey.title

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{survey.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Display */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-base font-medium text-blue-900">{questionText}</p>
            </div>

            {/* Audio Recorder */}
            <AudioRecorder onSubmit={handleSubmit} isLoading={isLoading} />

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Optional Email:</label>
              <input
                type="email"
                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Get notified when others respond</p>
            </div>
          </CardContent>
        </Card>

        {showThankYou && (
          <ThankYouModal
            onClose={() => router.push("/")}
            surveyTitle={survey.title}
            shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/respond/${survey.id}`}
          />
        )}
      </div>
    </div>
  )
}
