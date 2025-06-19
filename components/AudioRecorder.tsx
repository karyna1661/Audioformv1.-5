"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
  existingRecording?: Blob
  surveyId?: string
  questionIndex?: number
  key?: string | number
}

export function AudioRecorder({ onRecordingComplete, existingRecording, surveyId, questionIndex }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [finalDuration, setFinalDuration] = useState(0) // Store final duration
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Reset state when question changes
  useEffect(() => {
    console.log("AudioRecorder: Question changed to", questionIndex)
    setAudioBlob(existingRecording || null)
    setIsRecording(false)
    setIsPlaying(false)
    setRecordingTime(0)
    setFinalDuration(0)
    setError(null)

    // Cleanup any ongoing recording
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [questionIndex, existingRecording])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      console.log("Starting recording...")

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
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

        console.log("Recording stopped. Duration:", duration, "seconds")

        setAudioBlob(blob)
        setFinalDuration(duration) // Store the final duration
        onRecordingComplete?.(blob, duration)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Record start time
      startTimeRef.current = Date.now()
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingTime(elapsed)
      }, 1000)

      console.log("Recording started successfully")
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Failed to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping recording...")
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
    console.log("Resetting recording...")
    setAudioBlob(null)
    setRecordingTime(0)
    setFinalDuration(0)
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

  // Use finalDuration for display when recording is complete, recordingTime while recording
  const displayTime = isRecording ? recordingTime : audioBlob ? finalDuration : 0

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
      {error && (
        <div className="text-red-600 text-sm text-center mb-4 p-2 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Debug Info */}
      <div className="text-xs text-gray-400 text-center">
        <p>Recording Time: {recordingTime}s</p>
        <p>Final Duration: {finalDuration}s</p>
        <p>Display Time: {displayTime}s</p>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center space-x-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Mic className="w-6 h-6" />
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-16 h-16 animate-pulse shadow-lg"
          >
            <Square className="w-6 h-6" />
          </Button>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center space-x-3">
            <Button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full w-12 h-12 shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              onClick={resetRecording}
              variant="outline"
              className="rounded-full w-12 h-12 border-indigo-200 hover:bg-indigo-50 text-indigo-600"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Recording Status */}
      <div className="text-center">
        {isRecording && (
          <div className="text-indigo-600 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            Recording... {formatTime(displayTime)}
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="text-green-600 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Recording complete ({formatTime(displayTime)})
          </div>
        )}

        {!isRecording && !audioBlob && <div className="text-gray-600">Tap the microphone to start recording</div>}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        {!audioBlob
          ? "Click the button above to start recording your response"
          : "Use the play button to review your recording, or the reset button to record again"}
      </div>
    </div>
  )
}
