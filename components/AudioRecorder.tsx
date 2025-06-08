"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, RotateCcw, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface AudioRecorderProps {
  onSubmit: (audioUrl: string, duration: number) => void
  isLoading?: boolean
  disabled?: boolean
  questionId: string
  existingResponse?: { audioUrl: string; duration: number }
}

export function AudioRecorder({
  onSubmit,
  isLoading = false,
  disabled = false,
  questionId,
  existingResponse,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingResponse?.audioUrl || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasResponse, setHasResponse] = useState(!!existingResponse)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Reset state when question changes
    if (existingResponse) {
      setAudioUrl(existingResponse.audioUrl)
      setHasResponse(true)
      setRecordingTime(existingResponse.duration)
    } else {
      setAudioUrl(null)
      setHasResponse(false)
      setRecordingTime(0)
      setAudioBlob(null)
    }
  }, [questionId, existingResponse])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      toast.success("Recording started")
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Failed to start recording. Please check microphone permissions.")
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

      toast.success("Recording stopped")
    }
  }

  const playAudio = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
      }

      audio.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    if (audioUrl && !existingResponse) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsPlaying(false)
    setRecordingTime(0)
    setHasResponse(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const handleRecordingComplete = async () => {
    if (!audioBlob) return

    setIsUploading(true)

    try {
      // Generate unique filename
      const filePath = `audio-responses/${questionId}/${uuidv4()}.webm`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("audio-responses").upload(filePath, audioBlob, {
        contentType: "audio/webm",
      })

      if (error) {
        console.error("Upload failed:", error)
        toast.error("Failed to upload recording. Please try again.")
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("audio-responses").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Call parent callback with the URL and duration
      onSubmit(publicUrl, recordingTime)
      setHasResponse(true)

      toast.success("Recording saved successfully!")
    } catch (err: any) {
      console.error("Unexpected error during upload:", err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isProcessing = isLoading || isUploading

  return (
    <div className="space-y-6">
      {/* Recording Interface */}
      <div className="flex flex-col items-center space-y-6">
        {/* Recording Button */}
        <div className="relative">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isProcessing}
            size="lg"
            className={`w-20 h-20 rounded-full transition-all duration-200 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
          </Button>
        </div>

        {/* Recording Status - Fixed positioning */}
        <div className="text-center space-y-2">
          {isRecording ? (
            <>
              <p className="text-sm font-medium text-red-600">Recording...</p>
              <p className="text-lg font-mono text-gray-900">{formatTime(recordingTime)}</p>
              {/* Recording indicator dots - positioned below text */}
              <div className="flex items-center justify-center space-x-1 pt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </>
          ) : hasResponse ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">✓ Response recorded</p>
              <p className="text-sm text-gray-600">Duration: {formatTime(recordingTime)}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Tap to start recording</p>
          )}
        </div>
      </div>

      {/* Playback Controls - Properly aligned */}
      {audioUrl && !isRecording && (
        <div className="flex justify-center gap-3">
          <Button
            onClick={isPlaying ? pauseAudio : playAudio}
            variant="outline"
            size="sm"
            disabled={disabled || isProcessing}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            onClick={resetRecording}
            variant="outline"
            size="sm"
            disabled={disabled || isProcessing}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-record</span>
          </Button>
        </div>
      )}

      {/* Submit Button */}
      {audioBlob && !isRecording && !hasResponse && (
        <div className="flex justify-center">
          <Button
            onClick={handleRecordingComplete}
            disabled={disabled || isProcessing}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isUploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Save Response
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
