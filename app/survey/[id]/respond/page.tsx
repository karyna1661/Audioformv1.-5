"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Play, Pause, Square } from "lucide-react"
import { ThemedButton } from "@/components/ui/themed-button"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"]

export default function SurveyResponsePage() {
  const params = useParams()
  const surveyId = params.id as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<number, Blob>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase.from("surveys").select("*").eq("id", surveyId).single()

      if (error || !data) {
        toast.error("Survey not found")
        return
      }

      setSurvey(data)
    } catch (error) {
      console.error("Error fetching survey:", error)
      toast.error("Failed to load survey")
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Failed to start recording")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
    }
  }

  const saveResponse = async () => {
    if (!audioBlob || !survey) return

    try {
      setSubmitting(true)
      const questions = Array.isArray(survey.questions) ? survey.questions : []
      const currentQuestion = questions[currentQuestionIndex]

      if (!currentQuestion) {
        toast.error("Invalid question")
        return
      }

      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("surveyId", surveyId)
      formData.append("questionId", currentQuestion.id || `q${currentQuestionIndex}`)
      formData.append("questionIndex", currentQuestionIndex.toString())

      const response = await fetch("/api/responses", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to save response")
      }

      const result = await response.json()
      console.log("Response saved:", result)

      // Store response locally
      setResponses((prev) => ({ ...prev, [currentQuestionIndex]: audioBlob }))

      toast.success("Response saved successfully!")

      // Move to next question or finish
      const questions_array = Array.isArray(survey.questions) ? survey.questions : []
      if (currentQuestionIndex + 1 < questions_array.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        resetRecording()
      } else {
        toast.success("All responses submitted! Thank you for participating.")
      }
    } catch (error) {
      console.error("Error saving response:", error)
      toast.error("Failed to save response")
    } finally {
      setSubmitting(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Survey Not Found</h2>
            <p className="text-muted-foreground">The survey you're looking for doesn't exist or has expired.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const questions = Array.isArray(survey.questions) ? survey.questions : []
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">{survey.title}</CardTitle>
              <div className="text-center text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Question */}
          {currentQuestion && (
            <Card className="mb-6">
              <CardContent className="text-center py-8">
                <h2 className="text-xl font-semibold mb-8">{currentQuestion.text}</h2>

                {/* Recording Interface */}
                <div className="space-y-6">
                  {/* Microphone */}
                  <div className="flex justify-center">
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                          ? "bg-red-500 animate-pulse"
                          : audioBlob
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600"
                      }`}
                    >
                      {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                    </div>
                  </div>

                  {/* Recording Time */}
                  {(isRecording || audioBlob) && (
                    <div className="text-2xl font-mono font-bold">{formatTime(recordingTime)}</div>
                  )}

                  {/* Controls */}
                  <div className="flex justify-center gap-4">
                    {!isRecording && !audioBlob && (
                      <ThemedButton onClick={startRecording} size="lg">
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </ThemedButton>
                    )}

                    {isRecording && (
                      <ThemedButton onClick={stopRecording} variant="destructive" size="lg">
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording
                      </ThemedButton>
                    )}

                    {audioBlob && !isRecording && (
                      <div className="flex gap-2">
                        <ThemedButton onClick={playRecording} variant="outline" disabled={isPlaying}>
                          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isPlaying ? "Playing..." : "Play"}
                        </ThemedButton>
                        <ThemedButton onClick={resetRecording} variant="outline">
                          Re-record
                        </ThemedButton>
                        <ThemedButton onClick={saveResponse} disabled={submitting}>
                          {submitting ? "Saving..." : "Save & Continue"}
                        </ThemedButton>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card>
            <CardContent className="py-4">
              <div className="text-center text-sm text-muted-foreground">
                {Object.keys(responses).length} of {questions.length} questions completed
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
