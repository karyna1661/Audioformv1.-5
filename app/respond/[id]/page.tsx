"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { AudioRecorder } from "@/components/AudioRecorder"
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

  useEffect(() => {
    async function loadSurvey() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("surveys")
          .select(`
            *,
            responses(*)
          `)
          .eq("id", id)
          .single()

        if (error || !data) {
          throw error || new Error("Survey not found")
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

        // Parse questions - handle both string and object formats
        const parsedQuestions = Array.isArray(data.questions)
          ? data.questions
          : typeof data.questions === "string"
            ? [{ text: data.questions }]
            : [{ text: data.questions || "Please record your response" }]

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

  const handleRecordingComplete = (audioBlob: Blob) => {
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

        await supabase.from("responses").insert({
          survey_id: id,
          audio_path: uploadData.path,
          question_index: Number.parseInt(questionIndex),
        })
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
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return Home
          </button>
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
        {/* Survey Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

          {/* Response Count */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>
              {survey.responses?.length || 0} response{(survey.responses?.length || 0) !== 1 ? "s" : ""}
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
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
            <AudioRecorder onRecordingComplete={handleRecordingComplete} existingRecording={responses[currentIndex]} />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!responses[currentIndex]}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Survey
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!responses[currentIndex]}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
