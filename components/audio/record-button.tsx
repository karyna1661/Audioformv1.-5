"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadAudio } from "@/utils/supabase/storage"

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl?: string) => void
  onRecordingStart?: () => void
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  surveyId?: string
  questionId?: string
}

export function RecordButton({
  onRecordingComplete,
  onRecordingStart,
  className,
  variant = "default",
  size = "default",
  surveyId,
  questionId,
}: RecordButtonProps) {
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "stopping" | "processing" | "completed">(
    "idle",
  )
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setRecordingState("processing")
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        // If surveyId is provided, upload to Supabase
        let audioUrl
        if (surveyId) {
          try {
            const fileName = `${surveyId}_${questionId || "q"}_${Date.now()}.webm`
            const filePath = `${surveyId}/${fileName}`

            // Convert blob to file
            const file = new File([audioBlob], fileName, {
              type: audioBlob.type,
            })

            audioUrl = await uploadAudio(file, filePath)

            // Insert response record if this is a survey response
            if (questionId) {
              // This would typically be done in a server action or API route
              // For now, we'll just log it
              console.log("Would save response record for:", {
                surveyId,
                questionId,
                audioPath: filePath,
              })
            }
          } catch (error) {
            console.error("Error uploading audio:", error)
          }
        }

        onRecordingComplete(audioBlob, audioUrl)
        setRecordingState("completed")

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      // Start recording
      mediaRecorder.start()
      setRecordingState("recording")
      if (onRecordingStart) {
        onRecordingStart()
      }
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    setRecordingState("stopping")
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const handleClick = () => {
    if (recordingState === "idle" || recordingState === "completed") {
      startRecording()
    } else if (recordingState === "recording") {
      stopRecording()
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      disabled={recordingState === "stopping" || recordingState === "processing"}
      className={cn(recordingState === "recording" && "bg-red-500 hover:bg-red-600", className)}
    >
      {recordingState === "idle" || recordingState === "completed" ? (
        <Mic className="h-4 w-4 mr-2" />
      ) : recordingState === "recording" ? (
        <Square className="h-4 w-4 mr-2" />
      ) : (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      {recordingState === "idle" || recordingState === "completed"
        ? "Record"
        : recordingState === "recording"
          ? "Stop"
          : recordingState === "stopping"
            ? "Stopping..."
            : "Processing..."}
    </Button>
  )
}
