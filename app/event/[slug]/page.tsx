"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordButton } from "@/components/audio/record-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { EmailCaptureField } from "@/components/survey/email-capture-field"
import { useMobile } from "@/hooks/use-mobile"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"

interface EventSurvey {
  id: string
  title: string
  questions: { id: string; text: string }[]
}

interface EventData {
  id: string
  name: string
  slug: string
  surveys: EventSurvey[]
  branding?: {
    logoUrl?: string
    accentColor?: string
  }
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const eventSlug = params.slug
  const isMobile = useMobile()

  // State for event data
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for response process
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Record<string, Blob | null>>>({})
  const [audioUrls, setAudioUrls] = useState<Record<string, Record<string, string>>>({})
  const [email, setEmail] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Mock fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockEvent: EventData = {
          id: "event123",
          name: "Annual Conference 2023",
          slug: eventSlug,
          surveys: [
            {
              id: "survey1",
              title: "Session Feedback",
              questions: [
                { id: "q1", text: "What did you think of the keynote presentation?" },
                { id: "q2", text: "Which topics would you like to see covered in future events?" },
              ],
            },
            {
              id: "survey2",
              title: "Event Experience",
              questions: [
                { id: "q3", text: "How was your overall experience at the event?" },
                { id: "q4", text: "Do you have any suggestions for improving future events?" },
              ],
            },
          ],
          branding: {
            logoUrl: "/placeholder.svg?height=80&width=200",
            accentColor: "#6366F1",
          },
        }

        setEvent(mockEvent)

        // Initialize responses object
        const initialResponses: Record<string, Record<string, Blob | null>> = {}
        const initialAudioUrls: Record<string, Record<string, string>> = {}

        mockEvent.surveys.forEach((survey) => {
          initialResponses[survey.id] = {}
          initialAudioUrls[survey.id] = {}

          survey.questions.forEach((question) => {
            initialResponses[survey.id][question.id] = null
          })
        })

        setResponses(initialResponses)
        setAudioUrls(initialAudioUrls)
      } catch (err) {
        setError("Failed to load event. Please try again later.")
        console.error("Error fetching event:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventSlug])

  const handleRecordingComplete = (surveyId: string, questionId: string, audioBlob: Blob) => {
    // Update responses
    setResponses((prev) => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        [questionId]: audioBlob,
      },
    }))

    // Create URL for playback
    const url = URL.createObjectURL(audioBlob)
    setAudioUrls((prev) => ({
      ...prev,
      [surveyId]: {
        ...prev[surveyId],
        [questionId]: url,
      },
    }))
  }

  const handleEmailCapture = (capturedEmail: string) => {
    setEmail(capturedEmail)
  }

  const handleNext = () => {
    if (!event) return

    const currentSurvey = event.surveys[currentSurveyIndex]

    if (currentQuestionIndex < currentSurvey.questions.length - 1) {
      // Move to next question in current survey
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSurveyIndex < event.surveys.length - 1) {
      // Move to next survey, first question
      setCurrentSurveyIndex(currentSurveyIndex + 1)
      setCurrentQuestionIndex(0)
    } else {
      // Move to email capture
      setCurrentSurveyIndex(event.surveys.length)
      setCurrentQuestionIndex(0)
    }
  }

  const handlePrevious = () => {
    if (!event) return

    if (currentSurveyIndex === event.surveys.length) {
      // Move from email capture to last question of last survey
      setCurrentSurveyIndex(event.surveys.length - 1)
      setCurrentQuestionIndex(event.surveys[event.surveys.length - 1].questions.length - 1)
    } else if (currentQuestionIndex > 0) {
      // Move to previous question in current survey
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSurveyIndex > 0) {
      // Move to previous survey, last question
      setCurrentSurveyIndex(currentSurveyIndex - 1)
      setCurrentQuestionIndex(event.surveys[currentSurveyIndex - 1].questions.length - 1)
    }
  }

  const handleSubmit = async () => {
    if (!event) return

    setSubmitting(true)

    try {
      // Check if all questions have responses
      const allQuestionsAnswered = event.surveys.every((survey) =>
        survey.questions.every((question) => responses[survey.id]?.[question.id]),
      )

      if (!allQuestionsAnswered) {
        alert("Please answer all questions before submitting.")
        setSubmitting(false)
        return
      }

      if (!email) {
        alert("Please provide your email before submitting.")
        setSubmitting(false)
        return
      }

      // In a real app, this would upload each audio blob to storage
      // and then submit the response data to the API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setCompleted(true)
    } catch (err) {
      console.error("Error submitting responses:", err)
      alert("Failed to submit responses. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
              <p>{error || "Event not found"}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (completed) {
    return (
      <div
        className="container mx-auto px-4 py-16 max-w-md"
        style={{
          // Apply branding if available
          ...(event.branding?.accentColor &&
            ({
              "--accent-color": event.branding.accentColor,
            } as React.CSSProperties)),
        }}
      >
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="mb-6">Your feedback for {event.name} has been submitted successfully.</p>
            <Button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: event.branding?.accentColor || undefined,
                borderColor: event.branding?.accentColor || undefined,
              }}
            >
              Submit Another Response
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine current content
  let currentContent

  if (currentSurveyIndex < event.surveys.length) {
    const currentSurvey = event.surveys[currentSurveyIndex]
    const currentQuestion = currentSurvey.questions[currentQuestionIndex]
    const hasRecorded = !!responses[currentSurvey.id]?.[currentQuestion.id]
    const isLastQuestion =
      currentSurveyIndex === event.surveys.length - 1 && currentQuestionIndex === currentSurvey.questions.length - 1

    currentContent = (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {currentSurvey.title} - Question {currentQuestionIndex + 1} of {currentSurvey.questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6">{currentQuestion.text}</p>

          {!audioUrls[currentSurvey.id]?.[currentQuestion.id] ? (
            <RecordButton
              onRecordingComplete={(audioBlob) =>
                handleRecordingComplete(currentSurvey.id, currentQuestion.id, audioBlob)
              }
              className="w-full"
            />
          ) : (
            <div className="flex flex-col items-center">
              <PlayPauseButton audioUrl={audioUrls[currentSurvey.id][currentQuestion.id]} className="mb-4" />
              <Button
                variant="outline"
                onClick={() => {
                  // Clear the response and URL
                  setResponses((prev) => ({
                    ...prev,
                    [currentSurvey.id]: {
                      ...prev[currentSurvey.id],
                      [currentQuestion.id]: null,
                    },
                  }))

                  // Revoke the object URL to avoid memory leaks
                  URL.revokeObjectURL(audioUrls[currentSurvey.id][currentQuestion.id])

                  setAudioUrls((prev) => {
                    const newUrls = { ...prev }
                    delete newUrls[currentSurvey.id][currentQuestion.id]
                    return newUrls
                  })
                }}
              >
                Record Again
              </Button>
            </div>
          )}
        </CardContent>
        {!isMobile && (
          <div className="p-6 pt-0 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSurveyIndex === 0 && currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {!isLastQuestion ? (
              <Button
                onClick={handleNext}
                disabled={!hasRecorded}
                style={{
                  backgroundColor: event.branding?.accentColor || undefined,
                  borderColor: event.branding?.accentColor || undefined,
                }}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasRecorded}
                style={{
                  backgroundColor: event.branding?.accentColor || undefined,
                  borderColor: event.branding?.accentColor || undefined,
                }}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    )
  } else {
    // Email capture
    currentContent = (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Almost Done!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Please provide your email to complete the feedback.</p>
          <EmailCaptureField onEmailCapture={handleEmailCapture} />
        </CardContent>
        {!isMobile && (
          <div className="p-6 pt-0 flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!email || submitting}
              style={{
                backgroundColor: event.branding?.accentColor || undefined,
                borderColor: event.branding?.accentColor || undefined,
              }}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-xl"
      style={{
        // Apply branding if available
        ...(event.branding?.accentColor &&
          ({
            "--accent-color": event.branding.accentColor,
          } as React.CSSProperties)),
      }}
    >
      <div className="mb-8 text-center">
        {event.branding?.logoUrl && (
          <Image
            src={event.branding.logoUrl || "/placeholder.svg"}
            alt="Event Logo"
            width={200}
            height={80}
            className="h-16 mx-auto mb-4"
          />
        )}
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-muted-foreground">We value your feedback!</p>
      </div>

      {isMobile ? (
        <>
          {currentContent}

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSurveyIndex === 0 && currentQuestionIndex === 0}
              className="w-1/3"
            >
              Previous
            </Button>

            {currentSurveyIndex < event.surveys.length ? (
              <Button
                onClick={handleNext}
                disabled={
                  !responses[event.surveys[currentSurveyIndex].id]?.[
                    event.surveys[currentSurveyIndex].questions[currentQuestionIndex].id
                  ]
                }
                className="w-1/3"
                style={{
                  backgroundColor: event.branding?.accentColor || undefined,
                  borderColor: event.branding?.accentColor || undefined,
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!email || submitting}
                className="w-1/3"
                style={{
                  backgroundColor: event.branding?.accentColor || undefined,
                  borderColor: event.branding?.accentColor || undefined,
                }}
              >
                {submitting ? "..." : "Submit"}
              </Button>
            )}
          </div>
        </>
      ) : (
        currentContent
      )}
    </div>
  )
}
