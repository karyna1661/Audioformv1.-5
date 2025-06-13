"use client"

import { useState } from "react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

interface SurveyResponseClientProps {
  survey: {
    id: string
    title: string
    questions: any[]
    created_at: string
  }
}

export default function SurveyResponseClient({ survey }: SurveyResponseClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responses, setResponses] = useState<Record<string, { audioUrl: string; duration: number }>>({})
  const [showThankYou, setShowThankYou] = useState(false)

  const currentQuestion = survey.questions?.[currentQuestionIndex] || {
    id: "default",
    text: "What are your thoughts?",
  }

  const totalQuestions = survey.questions?.length || 1
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isFirstQuestion = currentQuestionIndex === 0

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleAudioSubmit = async (audioBlob: Blob, audioUrl: string) => {
    // Save response for current question
    setResponses({
      ...responses,
      [currentQuestion.id]: {
        audioUrl,
        duration: 0, // You could calculate this if needed
      },
    })

    // If last question, submit all responses
    if (isLastQuestion) {
      await submitAllResponses()
    } else {
      // Move to next question
      handleNext()
      toast.success("Response recorded! Moving to next question.")
    }
  }

  const submitAllResponses = async () => {
    setIsSubmitting(true)

    try {
      // Create a survey submission record
      const { data: submission, error: submissionError } = await supabase
        .from("survey_submissions")
        .insert({
          survey_id: survey.id,
          response_count: Object.keys(responses).length,
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (submissionError) {
        throw new Error(`Failed to create submission: ${submissionError.message}`)
      }

      // Create individual response records
      const responsePromises = Object.entries(responses).map(([questionId, { audioUrl }]) => {
        return supabase.from("survey_responses").insert({
          survey_id: survey.id,
          question_id: questionId,
          audio_url: audioUrl,
          submission_id: submission.id,
        })
      })

      await Promise.all(responsePromises)

      // Show thank you message
      setShowThankYou(true)
      toast.success("Thank you for completing the survey!")
    } catch (error) {
      console.error("Error submitting responses:", error)
      toast.error("Failed to submit responses. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Your responses have been submitted successfully.</p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{survey.title}</CardTitle>
          <div className="text-center text-sm text-gray-500 mt-2">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? "bg-indigo-600"
                    : index < currentQuestionIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-lg font-medium text-center mb-6">{currentQuestion.text}</div>

          <AudioRecorder onSubmit={handleAudioSubmit} isLoading={isSubmitting} />

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handlePrevious} disabled={isFirstQuestion || isSubmitting}>
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={isLastQuestion || isSubmitting || !responses[currentQuestion.id]}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
