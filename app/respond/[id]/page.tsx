"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"] & {
  responses: Database["public"]["Tables"]["responses"]["Row"][]
}

const supabase = createClientComponentClient<Database>()

interface Props {
  params: { id: string }
}

export default function RespondPage({ params: { id } }: Props) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<{ [key: number]: Blob }>({})
  const [responseCount, setResponseCount] = useState(0)

  // Debug logging
  useEffect(() => {
    console.log("RespondPage mounted with ID:", id)
    console.log("Current URL:", window.location.href)
  }, [id])

  useEffect(() => {
    async function loadSurvey() {
      try {
        setLoading(true)
        console.log("Loading survey with ID:", id)

        const { data, error } = await supabase
          .from("surveys")
          .select(`
            *,
            responses(*)
          `)
          .eq("id", id)
          .single()

        console.log("Survey query result:", { data, error })

        if (error) {
          console.error("Survey query error:", error)
          throw error
        }

        if (!data) {
          console.error("No survey data found")
          throw new Error("Survey not found")
        }

        // Check if survey is active
        if (!data.is_active) {
          setError("This survey is no longer active")
          return
        }

        // Check if survey is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This survey has expired")
          return
        }

        setSurvey(data as Survey)
        setResponseCount(data.responses?.length || 0)

        // Parse questions - handle both string and object formats
        let parsedQuestions: any[] = []

        if (Array.isArray(data.questions)) {
          parsedQuestions = data.questions
        } else if (typeof data.questions === "string") {
          parsedQuestions = [{ text: data.questions }]
        } else if (data.questions && typeof data.questions === "object") {
          parsedQuestions = [{ text: data.questions.text || "Please record your response" }]
        } else {
          parsedQuestions = [{ text: "Please record your response" }]
        }

        console.log("Parsed questions:", parsedQuestions)
        setQuestions(parsedQuestions)
      } catch (err) {
        console.error("Survey load error:", err)
        setError("Survey not found or expired")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadSurvey()
    }
  }, [id])

  // Set up real-time response counter
  useEffect(() => {
    if (!id) return

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
        () => {
          setResponseCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    console.log("Recording complete:", { audioBlob, duration })
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
      console.log("Submitting responses:", responses)

      // Submit all responses
      for (const [questionIndex, audioBlob] of Object.entries(responses)) {
        const file = new File([audioBlob], `response-${id}-${questionIndex}.webm`, {
          type: "audio/webm",
        })

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("demo-audio")
          .upload(`responses/${file.name}`, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          continue
        }

        const { error: insertError } = await supabase.from("responses").insert({
          survey_id: id,
          audio_path: uploadData.path,
          question_index: Number.parseInt(questionIndex),
        })

        if (insertError) {
          console.error("Insert error:", insertError)
        }
      }

      // Show success message and redirect
      alert("Thank you for your response!")
      router.push("/")
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to submit response. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
          <p className="text-xs text-gray-400 mt-2">Survey ID: {id}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Unavailable</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-400 mb-6">Survey ID: {id}</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
          <p className="text-xs text-gray-400 mt-2">Survey ID: {id}</p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Return Home
          </Button>
        </div>
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
        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>Survey ID: {id}</p>
          <p>Survey Title: {survey.title}</p>
          <p>Questions: {questions.length}</p>
          <p>Current Question: {currentIndex + 1}</p>
        </div>

        {/* Survey Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

          {/* Real-time Response Count */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>
              {responseCount} response{responseCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
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

          {/* Audio Recorder - Key prop forces re-render on question change */}
          <div className="mb-6">
            <AudioRecorder
              key={currentIndex} // This forces component re-render
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
        </div>
      </div>
    </div>
  )
}
