"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Users } from "lucide-react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ThankYouModal } from "@/components/ThankYouModal"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

interface Question {
  id: string
  text: string
}

interface Survey {
  id: string
  title: string
  description: string | null
  questions: Question[]
  is_active: boolean
  created_at: string
}

interface SurveyResponseClientProps {
  survey: Survey
}

export function SurveyResponseClient({ survey }: SurveyResponseClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Blob>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [responseCount, setResponseCount] = useState(0)

  const questions = Array.isArray(survey.questions) ? survey.questions : []
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Fetch response count
  useEffect(() => {
    const fetchResponseCount = async () => {
      try {
        const { count, error } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("survey_id", survey.id)

        if (!error && count !== null) {
          setResponseCount(count)
        }
      } catch (error) {
        console.error("Error fetching response count:", error)
      }
    }

    fetchResponseCount()

    // Set up real-time subscription for response count
    const channel = supabase
      .channel("responses")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `survey_id=eq.${survey.id}`,
        },
        () => {
          setResponseCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [survey.id])

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (!currentQuestion) return

    // Store the response for this question
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: audioBlob,
    }))

    toast.success("Response recorded!")
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitAll = async () => {
    setIsSubmitting(true)

    try {
      // Upload all responses
      for (const [questionId, audioBlob] of Object.entries(responses)) {
        const timestamp = Date.now()
        const fileName = `${survey.id}_${questionId}_${timestamp}.webm`
        const file = new File([audioBlob], fileName, { type: "audio/webm" })

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("demo-audio")
          .upload(`responses/${fileName}`, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          toast.error("Failed to upload response. Please try again.")
          return
        }

        // Save response record
        const { error: insertError } = await supabase.from("responses").insert({
          survey_id: survey.id,
          question_id: questionId,
          audio_path: uploadData.path,
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Database error:", insertError)
          toast.error("Failed to save response. Please try again.")
          return
        }
      }

      setShowThankYou(true)
      toast.success("All responses submitted successfully!")
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasCurrentResponse = currentQuestion && responses[currentQuestion.id]
  const allQuestionsAnswered = questions.every((q) => responses[q.id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {responseCount} responses
                </div>
              </div>

              {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          {currentQuestion && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">{currentQuestion.text}</h2>

                <AudioRecorder
                  onSubmit={handleAudioSubmit}
                  isLoading={isSubmitting}
                  key={currentQuestion.id} // Reset recorder for each question
                />

                {hasCurrentResponse && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-green-700 text-sm">✓ Response recorded for this question</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="text-sm text-gray-500">
                  {Object.keys(responses).length} of {questions.length} answered
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitAll}
                    disabled={!allQuestionsAnswered || isSubmitting}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit All Responses"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!hasCurrentResponse}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <ThankYouModal
          onClose={() => setShowThankYou(false)}
          surveyTitle={survey.title}
          shareUrl={`${window.location.origin}/respond/${survey.id}`}
        />
      )}
    </div>
  )
}
