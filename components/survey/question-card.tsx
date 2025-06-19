"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface QuestionCardProps {
  question: string | { text?: string; prompt?: string }
  questionIndex: number
  totalQuestions: number
  surveyId: string
  onNext: () => void
  onPrev: () => void
  isFirst: boolean
  isLast: boolean
  onComplete: () => void
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  surveyId,
  onNext,
  onPrev,
  isFirst,
  isLast,
  onComplete,
}: QuestionCardProps) {
  const [hasRecorded, setHasRecorded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract question text from different formats
  const questionText =
    typeof question === "string" ? question : question?.text || question?.prompt || "Please record your response"

  const handleRecordingComplete = () => {
    setHasRecorded(true)
  }

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      onNext()
      setHasRecorded(false) // Reset for next question
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {questionIndex + 1} of {totalQuestions}
          </CardTitle>
          {totalQuestions > 1 && (
            <div className="flex gap-1">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === questionIndex ? "bg-indigo-600" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{questionText}</h2>
        </div>

        {/* Audio Recorder */}
        <div className="flex justify-center">
          <AudioRecorder
            surveyId={surveyId}
            questionIndex={questionIndex}
            onRecordingComplete={handleRecordingComplete}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={onPrev} disabled={isFirst} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button onClick={handleNext} disabled={!hasRecorded && !isSubmitting} className="flex items-center gap-2">
            {isLast ? "Complete Survey" : "Next Question"}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Helper Text */}
        {!hasRecorded && <p className="text-sm text-gray-500 text-center">Record your response to continue</p>}
      </CardContent>
    </Card>
  )
}
