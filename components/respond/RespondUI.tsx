"use client"
import { useState } from "react"
import type { Database } from "@/types/supabase"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ThankYouModal } from "@/components/ThankYouModal"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react"
import { toast } from "sonner"

type Survey = Database["public"]["Tables"]["surveys"]["Row"]

export default function RespondUI({ survey }: { survey: Survey }) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Blob>>({})
  const [showThankYou, setShowThankYou] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const questions = Array.isArray(survey.questions) ? survey.questions : []
  const question = questions[idx]

  const handleAudioSubmit = async (audioBlob: Blob) => {
    if (!question) return

    const questionId = question.id || `q${idx}`
    setAnswers((prev) => ({ ...prev, [questionId]: audioBlob }))

    toast.success("Response recorded!")
  }

  const handleNext = async () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
    } else {
      // Upload all answers and submit
      setIsSubmitting(true)
      try {
        await submitAllResponses(survey.id, answers)
        setShowThankYou(true)
        toast.success("All responses submitted successfully!")
      } catch (error) {
        console.error("Submission error:", error)
        toast.error("Failed to submit responses. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handlePrevious = () => {
    if (idx > 0) {
      setIdx(idx - 1)
    }
  }

  const handleShare = async () => {
    const shareLink = `${window.location.origin}/respond/${survey.id}`
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success("Survey link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const progress = ((idx + 1) / questions.length) * 100
  const currentQuestionText = typeof question === "string" ? question : question?.text || question?.prompt || "Question"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {idx + 1} of {questions.length}
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
          </div>

          {/* Question */}
          {question && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">{currentQuestionText}</h2>

              <AudioRecorder
                onSubmit={handleAudioSubmit}
                isLoading={isSubmitting}
                key={idx} // Reset recorder for each question
              />

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={idx === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="text-sm text-gray-500">
                  {Object.keys(answers).length} of {questions.length} answered
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!answers[question.id || `q${idx}`] || isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {idx + 1 === questions.length ? "Submit All" : "Next"}
                  {idx + 1 < questions.length && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
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

// Helper function to submit all responses
async function submitAllResponses(surveyId: string, answers: Record<string, Blob>) {
  for (const [questionId, audioBlob] of Object.entries(answers)) {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    formData.append("surveyId", surveyId)
    formData.append("questionId", questionId)

    const response = await fetch("/api/responses", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to submit response for question ${questionId}`)
    }
  }
}
