"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface AudioRecorderProps {
  onSubmit: (audioBlob: Blob) => void
  isLoading: boolean
}

export function AudioRecorder({ onSubmit, isLoading }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
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

  const handleSubmit = () => {
    if (audioBlob) {
      onSubmit(audioBlob)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="text-center space-y-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            disabled={isLoading}
            className="w-full h-16 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            size="lg"
          >
            <Mic className="mr-2 h-6 w-6" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            className="w-full h-16 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white animate-pulse"
            size="lg"
          >
            <Square className="mr-2 h-6 w-6" />
            Stop Recording
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-indigo-600 font-medium">Recording in progress...</span>
          </div>
        )}
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isPlaying ? pauseAudio : playAudio}
              variant="outline"
              size="sm"
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-600"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button
              onClick={resetRecording}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Record Again
            </Button>
          </div>

          <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />

          {/* Audio Waveform Visualization */}
          <div className="h-12 bg-indigo-50 rounded-md flex items-center justify-center p-2 my-2">
            <div className="flex items-end space-x-1 h-full w-full">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-indigo-400 to-purple-500 rounded-full w-1.5"
                  style={{
                    height: `${Math.max(15, Math.min(100, 30 + Math.sin(i * 0.5) * 70))}%`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          <p className="text-xs text-center text-gray-600">Preview your recording before submitting</p>
        </div>
      )}

      {/* Submit Button */}
      {audioBlob && (
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          size="lg"
        >
          {isLoading ? "Submitting..." : "Submit Response"}
        </Button>
      )}
    </div>
  )
}
