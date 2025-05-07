"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordButton } from "@/components/audio/record-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { EmailCaptureField } from "@/components/survey/email-capture-field"
import { SwipeNavigator } from "@/components/mobile/swipe-navigator"
import { useMobile } from "@/hooks/use-mobile"
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { supabaseBrowser } from "@/lib/supabaseClient"

interface SurveyQuestion {
  id: string
  text: string
}

interface SurveyData {
  id: string
  title: string
  questions: SurveyQuestion[]
  expiresAt: string
  isExpired: boolean
}

export default function RespondDemoPage({ params }: { params: { id: string } }) {
  const surveyId = params.id
  const isMobile = useMobile()

  // State for survey data
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState("")

  // State for response process
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Blob | null>>({})
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})
  const [email, setEmail] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Fetch survey data from Supabase
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true)

        // Get survey from Supabase
        const { data: surveyData, error: surveyError } = await supabaseBrowser
          .from("surveys")
          .select("*")
          .eq("id", surveyId)
          .single()

        if (surveyError) throw surveyError

        // Check if survey is expired
        const now = new Date()
        const expiry = new Date(surveyData.expires_at)
        const isExpired = now >= expiry

        // Create survey object
        const surveyObj: SurveyData = {
          id: surveyId,
          title: surveyData.title || "Demo Survey",
          questions: surveyData.questions || [],
          expiresAt: surveyData.expires_at,
          isExpired,
        }

        setSurvey(surveyObj)

        // Initialize responses object
        const initialResponses: Record<string, Blob | null> = {}
        surveyObj.questions.forEach((q) => {
          initialResponses[q.id] = null
        })
        setResponses(initialResponses)
      } catch (err) {
        setError("Failed to load survey. Please try again later.")
        console.error("Error fetching survey:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [surveyId])

  // Update time remaining
  useEffect(() => {
    if (!survey) return

    const updateTimeRemaining = () => {
      const now = new Date()
      const expiry = new Date(survey.expiresAt)

      if (now >= expiry) {
        setSurvey({ ...survey, isExpired: true })
        setTimeRemaining("Expired")
      } else {
        setTimeRemaining(formatDistanceToNow(expiry, { addSuffix: false }))
      }
    }

    // Initial update
    updateTimeRemaining()

    // Set up interval to update time remaining
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [survey])

  const handleRecordingComplete = async (questionId: string, audioBlob: Blob, audioUrl?: string) => {
    // Update responses
    setResponses((prev) => ({
      ...prev,
      [questionId]: audioBlob,
    }))

    // If we have a URL from Supabase, use it, otherwise create a local URL
    const url = audioUrl || URL.createObjectURL(audioBlob)
    setAudioUrls((prev) => ({
      ...prev,
      [questionId]: url,
    }))
  }

  const handleEmailCapture = (capturedEmail: string) => {
    setEmail(capturedEmail)
  }

  const handleNext = () => {
    if (currentQuestionIndex < (survey?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!survey) return

    setSubmitting(true)

    try {
      // Check if all questions have responses
      const allQuestionsAnswered = survey.questions.every((q) => responses[q.id])

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

      // Update email for all responses in Supabase
      for (const question of survey.questions) {
        if (responses[question.id]) {
          // Find the response in Supabase by survey_id and question_id
          const { data: responseData } = await supabaseBrowser
            .from("responses")
            .select("id")
            .eq("survey_id", surveyId)
            .eq("question_id", question.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (responseData) {
            // Update the email
            await supabaseBrowser.from("responses").update({ email }).eq("id", responseData.id)
          }
        }
      }

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
              <p>{error || "Survey not found"}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (survey.isExpired) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Clock className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Survey Expired</h2>
            <p className="mb-6">This demo survey has expired and is no longer accepting responses.</p>
            <Button onClick={() => (window.location.href = "/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="mb-6">Your responses have been submitted successfully.</p>
            <Button onClick={() => (window.location.href = "/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = survey.questions[currentQuestionIndex]
  const hasRecorded = !!responses[currentQuestion.id]
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1

  const questionCards = survey.questions.map((question, index) => (
    <div key={question.id} className="w-full">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Question {index + 1} of {survey.questions.length}
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeRemaining} remaining
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6">{question.text}</p>

          {!audioUrls[question.id] ? (
            <RecordButton
              onRecordingComplete={(audioBlob, audioUrl) => handleRecordingComplete(question.id, audioBlob, audioUrl)}
              className="w-full"
              surveyId={surveyId}
              questionId={question.id}
            />
          ) : (
            <div className="flex flex-col items-center">
              <PlayPauseButton audioUrl={audioUrls[question.id]} className="mb-4" />
              <Button
                variant="outline"
                onClick={() => {
                  // Clear the response and URL
                  setResponses((prev) => ({ ...prev, [question.id]: null }))

                  // Revoke the object URL to avoid memory leaks
                  if (!audioUrls[question.id].includes("supabase")) {
                    URL.revokeObjectURL(audioUrls[question.id])
                  }

                  setAudioUrls((prev) => {
                    const newUrls = { ...prev }
                    delete newUrls[question.id]
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
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {!isLastQuestion ? (
              <Button onClick={handleNext} disabled={!hasRecorded}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestionIndex(survey.questions.length)} disabled={!hasRecorded}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  ))

  // Add email capture as the last "question"
  questionCards.push(
    <div key="email-capture" className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Almost Done!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Please provide your email to complete the survey.</p>
          <EmailCaptureField onEmailCapture={handleEmailCapture} />
        </CardContent>
        {!isMobile && (
          <div className="p-6 pt-0 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentQuestionIndex(survey.questions.length - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button onClick={handleSubmit} disabled={!email || submitting}>
              {submitting ? "Submitting..." : "Submit Responses"}
            </Button>
          </div>
        )}
      </Card>
    </div>,
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{survey.title}</h1>
        <div className="flex justify-center mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Demo survey • {timeRemaining} remaining
          </Badge>
        </div>
      </div>

      {isMobile ? (
        <>
          <SwipeNavigator currentIndex={currentQuestionIndex} onIndexChange={setCurrentQuestionIndex} className="mb-6">
            {questionCards}
          </SwipeNavigator>

          {currentQuestionIndex === survey.questions.length ? (
            <Button className="w-full" onClick={handleSubmit} disabled={!email || submitting}>
              {submitting ? "Submitting..." : "Submit Responses"}
            </Button>
          ) : (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="w-1/3"
              >
                Previous
              </Button>

              {!isLastQuestion ? (
                <Button onClick={handleNext} disabled={!hasRecorded} className="w-1/3">
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(survey.questions.length)}
                  disabled={!hasRecorded}
                  className="w-1/3"
                >
                  Continue
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        questionCards[currentQuestionIndex === survey.questions.length ? survey.questions.length : currentQuestionIndex]
      )}
    </div>
  )
}
