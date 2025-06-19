"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void
  existingRecording?: Blob
  surveyId?: string
  questionIndex?: number
}

export function AudioRecorder({ onRecordingComplete, existingRecording, surveyId, questionIndex }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingRecording || null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setAudioBlob(blob)
        onRecordingComplete?.(blob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Failed to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.play()
      setIsPlaying(true)
    }
  }

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setError(null)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
      {error && <div className="text-red-600 text-sm text-center mb-4">{error}</div>}

      {/* Recording Controls */}
      <div className="flex items-center space-x-4">
        {!isRecording && !audioBlob && (
          <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16">
            <Mic className="w-6 h-6" />
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 animate-pulse"
          >
            <Square className="w-6 h-6" />
          </Button>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button onClick={resetRecording} variant="outline" className="rounded-full w-12 h-12">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Recording Status */}
      <div className="text-center">
        {isRecording && <div className="text-red-600 font-medium">Recording... {formatTime(recordingTime)}</div>}

        {audioBlob && !isRecording && (
          <div className="text-green-600 font-medium">✓ Recording complete ({formatTime(recordingTime)})</div>
        )}

        {!isRecording && !audioBlob && <div className="text-gray-500">Tap the microphone to start recording</div>}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        {!audioBlob
          ? "Click the red button to start recording your response"
          : "Use the play button to review your recording, or the reset button to record again"}
      </div>
    </div>
  )
}
