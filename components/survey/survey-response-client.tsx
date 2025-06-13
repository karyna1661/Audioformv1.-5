"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ThankYouModal } from "@/components/ThankYouModal"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SurveyResponseClientProps {
  survey: {
    id: string
    title: string
    description?: string
    questions: any[]
    created_at: string
    expires_at?: string
  }
}

export default function SurveyResponseClient({ survey }: SurveyResponseClientProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showThankYouModal, setShowThankYouModal] = useState(false)

  // Ensure questions is an array
  const questions = Array.isArray(survey.questions)
    ? survey.questions
    : typeof survey.questions === "object"
      ? Object.values(survey.questions)
      : []

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (!currentQuestion) return

    try {
      // Upload audio to Supabase storage
      const filename = `${survey.id}/${currentQuestion.id}_${Date.now()}.webm`
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/responses", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload audio")
      }

      const { url } = await response.json()

      // Store the response URL
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: url,
      }))

      // Move to next question or submit all responses
      if (!isLastQuestion) {
        setCurrentQuestionIndex((prev) => prev + 1)
        toast.success("Response recorded! Moving to next question.")
      } else {
        // Submit all responses
        await submitResponses({
          ...responses,
          [currentQuestion.id]: url,
        })
      }
    } catch (error) {
      console.error("Error handling audio submission:", error)
      toast.error("Failed to save your response. Please try again.")
    }
  }

  const submitResponses = async (allResponses: Record<string, string>) => {
    try {
      setSubmitting(true)

      // Submit to Supabase
      const { error } = await supabase.from("responses").insert({
        survey_id: survey.id,
        answers: allResponses,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success("All responses submitted successfully!")
      setShowThankYouModal(true)
    } catch (error) {
      console.error("Error submitting responses:", error)
      toast.error("Failed to submit responses. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  // Generate share link with proper base URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const shareLink = `${baseUrl}/respond/${survey.id}`

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
            <div className="w-16"></div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {currentQuestion && (
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl">
                  Question {currentQuestionIndex + 1}
                  {isLastQuestion && " (Final)"}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentQuestion.prompt || currentQuestion.text || "Please record your response"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AudioRecorder onSubmit={handleAudioSubmit} isLoading={submitting} />

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500 flex items-center">
                    {Object.keys(responses).length > 0 && (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        {Object.keys(responses).length} of {questions.length} answered
                      </>
                    )}
                  </div>

                  {!isLastQuestion && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      disabled={!responses[currentQuestion.id]}
                      className="flex items-center"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYouModal && (
        <ThankYouModal
          onClose={() => {
            setShowThankYouModal(false)
            router.push("/")
          }}
          surveyTitle={survey.title}
          shareUrl={shareLink}
        />
      )}
    </div>
  )
}
