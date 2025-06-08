"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { AudioRecorder } from "@/components/AudioRecorder"
import { submitResponseSimple } from "@/lib/actions/submitResponse"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSurveyStats } from "@/hooks/use-survey-stats"

interface Question {
  id: string
  prompt: string
}

interface Survey {
  id: string
  title: string
  description?: string
  questions: Question[]
}

interface SurveyResponderProps {
  survey: Survey
  onComplete: () => void
}

export function SurveyResponder({ survey, onComplete }: SurveyResponderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, { url: string; duration: number }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { count, avgTime } = useSurveyStats(survey.id)

  const currentQuestion = survey.questions[currentIndex]
  const totalQuestions = survey.questions.length
  const hasResponse = currentQuestion && responses[currentQuestion.id]

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      handleFinalSubmit()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleResponse = (questionId: string, audioUrl: string, duration: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { url: audioUrl, duration },
    }))
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Submit all responses
      for (const questionId in responses) {
        const { url, duration } = responses[questionId]
        const result = await submitResponseSimple({
          audioUrl: url,
          surveyId: survey.id,
          duration,
        })

        if (!result.success) {
          throw new Error(result.error || "Failed to submit response")
        }
      }

      toast.success("All responses submitted successfully!")
      onComplete()
    } catch (error: any) {
      console.error("Error submitting responses:", error)
      toast.error(error.message || "Failed to submit responses")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastQuestion = currentIndex === totalQuestions - 1

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{survey.title}</CardTitle>
          <div className="text-sm text-gray-500">
            {count} responses · Avg. time: {avgTime}s
          </div>
        </div>
        <CardDescription>{survey.description}</CardDescription>

        {/* Question progress indicator */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm font-medium">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
          <div className="flex space-x-1">
            {survey.questions.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-indigo-600" : "bg-gray-300"}`} />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="text-lg font-medium">{currentQuestion?.prompt}</div>

          <AudioRecorder
            onSubmit={(audioUrl, duration) => handleResponse(currentQuestion.id, audioUrl, duration)}
            isLoading={isSubmitting}
          />
        </div>
      </CardContent>

      <CardFooter>
        <div className="mt-4 flex justify-between w-full px-6">
          <Button onClick={handlePrev} variant="outline" disabled={currentIndex === 0 || isSubmitting}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!hasResponse || isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            {isLastQuestion ? (
              isSubmitting ? (
                "Submitting..."
              ) : (
                "Submit All"
              )
            ) : (
              <>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
