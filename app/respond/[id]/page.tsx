"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter, useParams } from "next/navigation"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"] & {
  responses: Database["public"]["Tables"]["responses"]["Row"][]
}

const supabase = createClientComponentClient<Database>()

export default function RespondPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<{ [key: number]: Blob }>({})
  const [responseCount, setResponseCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Comprehensive debugging
  useEffect(() => {
    const debug = {
      surveyId: id,
      currentUrl: typeof window !== "undefined" ? window.location.href : "N/A",
      pathname: typeof window !== "undefined" ? window.location.pathname : "N/A",
      params: params,
      timestamp: new Date().toISOString(),
    }

    setDebugInfo(debug)
    console.log("RespondPage Debug Info:", debug)
  }, [id, params])

  useEffect(() => {
    async function loadSurvey() {
      if (!id) {
        console.error("No survey ID provided")
        setError("No survey ID provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log("Loading survey with ID:", id)

        // Test database connection first
        const { data: testData, error: testError } = await supabase.from("surveys").select("count").limit(1)

        if (testError) {
          console.error("Database connection test failed:", testError)
          setError("Database connection failed")
          return
        }

        console.log("Database connection successful")

        // Fetch survey with comprehensive error handling
        const { data, error, status, statusText } = await supabase
          .from("surveys")
          .select(`
            *,
            responses(*)
          `)
          .eq("id", id)
          .single()

        console.log("Survey query response:", {
          data: data ? "Survey found" : "No survey",
          error,
          status,
          statusText,
          surveyId: id,
        })

        if (error) {
          console.error("Survey query error:", error)
          if (error.code === "PGRST116") {
            setError("Survey not found - the survey ID may be incorrect or the survey may have been deleted")
          } else {
            setError(`Database error: ${error.message}`)
          }
          return
        }

        if (!data) {
          console.error("No survey data returned")
          setError("Survey not found")
          return
        }

        console.log("Survey loaded successfully:", {
          id: data.id,
          title: data.title,
          isActive: data.is_active,
          expiresAt: data.expires_at,
        })

        // Check survey status
        if (!data.is_active) {
          setError("This survey is no longer active")
          return
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This survey has expired")
          return
        }

        setSurvey(data as Survey)
        setResponseCount(data.responses?.length || 0)

        // Parse questions with comprehensive handling
        let parsedQuestions: any[] = []

        if (Array.isArray(data.questions)) {
          parsedQuestions = data.questions
        } else if (typeof data.questions === "string") {
          parsedQuestions = [{ text: data.questions, order: 1 }]
        } else if (data.questions && typeof data.questions === "object") {
          parsedQuestions = [{ text: data.questions.text || "Please record your response", order: 1 }]
        } else {
          parsedQuestions = [{ text: "Please record your response", order: 1 }]
        }

        console.log("Parsed questions:", parsedQuestions)
        setQuestions(parsedQuestions)
      } catch (err) {
        console.error("Unexpected error loading survey:", err)
        setError(`Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [id])

  // Real-time response counter with enhanced error handling
  useEffect(() => {
    if (!id || !survey) return

    console.log("Setting up real-time subscription for survey:", id)

    const channel = supabase
      .channel(`survey-${id}-responses`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `survey_id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time response received:", payload)
          setResponseCount((prev) => {
            const newCount = prev + 1
            console.log("Response count updated:", prev, "->", newCount)
            return newCount
          })
        },
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status)
      })

    return () => {
      console.log("Cleaning up real-time subscription")
      supabase.removeChannel(channel)
    }
  }, [id, survey])

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    console.log("Recording complete:", { audioBlob, duration, questionIndex: currentIndex })
    setResponses((prev) => ({ ...prev, [currentIndex]: audioBlob }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      console.log("Submitting responses:", Object.keys(responses).length, "responses")

      let successCount = 0
      let errorCount = 0

      for (const [questionIndex, audioBlob] of Object.entries(responses)) {
        try {
          const file = new File([audioBlob], `response-${id}-${questionIndex}-${Date.now()}.webm`, {
            type: "audio/webm",
          })

          console.log("Uploading file:", file.name, "Size:", file.size)

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("demo-audio")
            .upload(`responses/${file.name}`, file)

          if (uploadError) {
            console.error("Upload error for question", questionIndex, ":", uploadError)
            errorCount++
            continue
          }

          console.log("Upload successful:", uploadData.path)

          const { error: insertError } = await supabase.from("responses").insert({
            survey_id: id,
            audio_path: uploadData.path,
            question_index: Number.parseInt(questionIndex),
            created_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Insert error for question", questionIndex, ":", insertError)
            errorCount++
          } else {
            successCount++
            console.log("Response saved for question", questionIndex)
          }
        } catch (err) {
          console.error("Error processing question", questionIndex, ":", err)
          errorCount++
        }
      }

      console.log("Submission complete:", { successCount, errorCount })

      if (successCount > 0) {
        alert(`Thank you for your response! ${successCount} response(s) submitted successfully.`)
        router.push("/")
      } else {
        alert("Failed to submit responses. Please try again.")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to submit response. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Loading survey...</p>
            <p className="text-xs text-gray-400">Survey ID: {id}</p>
            <p className="text-xs text-gray-400">URL: {debugInfo.currentUrl}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Survey Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>

            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              <p>
                <strong>Debug Information:</strong>
              </p>
              <p>Survey ID: {id}</p>
              <p>Current URL: {debugInfo.currentUrl}</p>
              <p>Pathname: {debugInfo.pathname}</p>
              <p>Timestamp: {debugInfo.timestamp}</p>
            </div>

            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-gray-600">Survey not found</p>
            <p className="text-xs text-gray-400">Survey ID: {id}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const questionText =
    typeof currentQuestion === "string"
      ? currentQuestion
      : currentQuestion?.text || currentQuestion?.prompt || "Please record your response"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        {/* Survey Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

            {/* Real-time Response Count */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>
                {responseCount} response{responseCount !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card>
          <CardContent className="p-6">
            {/* Progress Indicator */}
            {questions.length > 1 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-center mt-4 gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentIndex ? "bg-indigo-600" : index < currentIndex ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{questionText}</h2>
            </div>

            {/* Audio Recorder */}
            <div className="mb-6">
              <AudioRecorder
                key={`${currentIndex}-${survey.id}`} // Enhanced key for proper re-rendering
                onRecordingComplete={handleRecordingComplete}
                existingRecording={responses[currentIndex]}
                questionIndex={currentIndex}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex items-center gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!responses[currentIndex]}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center gap-2"
                >
                  Submit Survey
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!responses[currentIndex]}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
