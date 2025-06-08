"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

interface AudioRecorderProps {
  onSubmit: (audioUrl: string) => void
  isLoading: boolean
}

export function AudioRecorder({ onSubmit, isLoading }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const supabase = createClient()

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("Microphone access granted")

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log("Recording stopped, processing audio...")
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
        console.log("Audio processed successfully")
      }

      mediaRecorder.start()
      setIsRecording(true)
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
      toast.success("Recording stopped")
    }
  }

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleRecordingComplete = async () => {
    if (!audioBlob) return

    setIsUploading(true)

    try {
      console.log("Uploading audio to Supabase...")

      // Generate unique filename
      const filePath = `demo-audio/${uuidv4()}.webm`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("demo-audio").upload(filePath, audioBlob, {
        contentType: "audio/webm",
      })

      if (error) {
        console.error("Upload failed:", error)
        toast.error("Failed to upload recording. Please try again.")
        return
      }

      console.log("Upload successful:", data)

      // Get public URL
      const { data: urlData } = supabase.storage.from("demo-audio").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      console.log("Public URL generated:", publicUrl)

      // Call parent callback with the URL
      onSubmit(publicUrl)

      toast.success("Recording submitted successfully!")

      // Reset state
      resetRecording()
    } catch (err: any) {
      console.error("Unexpected error during upload:", err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const isProcessing = isLoading || isUploading

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Recording Controls */}
      <div className="text-center space-y-4">
        {!isRecording && !audioBlob && (
          <div className="space-y-4">
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              className="w-full h-16 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Mic className="mr-2 h-6 w-6" />
              Start Recording
            </Button>
            <p className="text-sm text-gray-600">Tap to start recording your response</p>
          </div>
        )}

        {isRecording && (
          <div className="space-y-4">
            <Button
              onClick={stopRecording}
              className="w-full h-16 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg animate-pulse"
              size="lg"
            >
              <Square className="mr-2 h-6 w-6" />
              Stop Recording
            </Button>

            {/* Three-dot recording indicator */}
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
              <div
                className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span className="text-indigo-600 font-medium ml-3">Recording in progress...</span>
            </div>
          </div>
        )}
      </div>

      {/* Audio Playback Controls - Aligned properly */}
      {audioUrl && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
          <div className="space-y-4">
            {/* Playback & Re-record buttons - aligned in center */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={isPlaying ? pauseAudio : playAudio}
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="border-indigo-200 hover:bg-indigo-50 text-indigo-600 shadow-sm"
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                onClick={resetRecording}
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="border-indigo-200 hover:bg-indigo-50 text-indigo-600 shadow-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-record
              </Button>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
              crossOrigin="anonymous"
            />

            <p className="text-xs text-center text-gray-600">Preview your recording before submitting</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {audioBlob && (
        <div className="flex justify-center">
          <Button
            onClick={handleRecordingComplete}
            disabled={isProcessing}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isUploading ? "Uploading..." : "Submitting..."}</span>
              </div>
            ) : (
              "Submit Response"
            )}
          </Button>
        </div>
      )}

      {/* Demo link removed - no longer displayed */}
    </div>
  )
}
