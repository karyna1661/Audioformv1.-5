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
  const animationRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context and analyser for visualization
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256

      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source
      source.connect(analyser)

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
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }

      // Start recording
      mediaRecorder.start()
      setRecordingState("recording")
      if (onRecordingStart) {
        onRecordingStart()
      }

      // Start visualization
      drawWaveform()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    setRecordingState("stopping")
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (recordingState !== "recording") return

      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(255, 0, 0)"
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * (canvas.height / 2)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
  }

  const handleClick = () => {
    if (recordingState === "idle" || recordingState === "completed") {
      startRecording()
    } else if (recordingState === "recording") {
      stopRecording()
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        disabled={recordingState === "stopping" || recordingState === "processing"}
        className={cn(recordingState === "recording" && "bg-red-500 hover:bg-red-600", "relative")}
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

      {recordingState === "recording" && (
        <div className="mt-2 w-full h-12 bg-slate-100 rounded-md overflow-hidden">
          <canvas ref={canvasRef} width={300} height={48} className="w-full h-full" />
        </div>
      )}
    </div>
  )
}
