"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface AudioRecorderProps {
  onSubmit: (audioUrl: string, duration: number) => void
  isLoading?: boolean
  disabled?: boolean
}

export function AudioRecorder({ onSubmit, isLoading = false, disabled = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

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
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsPlaying(false)
    setRecordingTime(0)
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
      const filePath = `audio-responses/${uuidv4()}.webm`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("audio-responses").upload(filePath, audioBlob, {
        contentType: "audio/webm",
      })

      if (error) {
        console.error("Upload failed:", error)
        toast.error("Failed to upload recording. Please try again.")
        setIsUploading(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("audio-responses").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Call parent callback with the URL and duration
      onSubmit(publicUrl, recordingTime)

      // Reset state
      resetRecording()
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
      <div className="flex flex-col items-center space-y-4">
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

          {/* Recording indicator dots */}
          {isRecording && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
        </div>

        {/* Recording Status */}
        <div className="text-center">
          {isRecording ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">Recording...</p>
              <p className="text-lg font-mono text-gray-900">{formatTime(recordingTime)}</p>
            </div>
          ) : audioBlob ? (
            <p className="text-sm font-medium text-green-600">Recording complete</p>
          ) : (
            <p className="text-sm text-gray-600">Tap to start recording</p>
          )}
        </div>
      </div>

      {/* Playback Controls - Properly aligned */}
      {audioBlob && !isRecording && (
        <div className="flex justify-center space-x-3">
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
      {audioBlob && !isRecording && (
        <div className="flex justify-center">
          <Button
            onClick={handleRecordingComplete}
            disabled={disabled || isProcessing}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isUploading ? "Uploading..." : "Submitting..."}
              </>
            ) : (
              "Submit Response"
            )}
          </Button>
        </div>
      )}

      {/* Demo link removed */}
    </div>
  )
}
