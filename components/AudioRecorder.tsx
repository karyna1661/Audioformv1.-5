"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  existingRecording?: Blob
  questionIndex?: number
}

export function AudioRecorder({ onRecordingComplete, existingRecording, questionIndex = 0 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingRecording || null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const recordingStartTimeRef = useRef<number>(0)

  // Reset state when question changes
  useEffect(() => {
    setAudioBlob(existingRecording || null)
    setRecordingTime(0)
    setPlaybackTime(0)
    setDuration(0)
    setIsRecording(false)
    setIsPlaying(false)

    // Clean up intervals
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
    }
  }, [questionIndex, existingRecording])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm;codecs=opus" })
        const finalDuration = (Date.now() - recordingStartTimeRef.current) / 1000

        setAudioBlob(blob)
        setDuration(finalDuration)
        onRecordingComplete(blob, finalDuration)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())

        console.log("Recording completed:", {
          duration: finalDuration,
          blobSize: blob.size,
          questionIndex,
        })
      }

      mediaRecorderRef.current = mediaRecorder
      recordingStartTimeRef.current = Date.now()

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)

      // Update recording time every 100ms for smooth display
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000
        setRecordingTime(elapsed)
      }, 100)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || duration)
      }

      audio.onplay = () => {
        setIsPlaying(true)
        setPlaybackTime(0)

        // Update playback time
        playbackIntervalRef.current = setInterval(() => {
          if (audio.currentTime) {
            setPlaybackTime(audio.currentTime)
          }
        }, 100)
      }

      audio.onpause = () => {
        setIsPlaying(false)
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current)
        }
      }

      audio.onended = () => {
        setIsPlaying(false)
        setPlaybackTime(0)
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current)
        }
        URL.revokeObjectURL(audioUrl)
      }

      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
    }
  }

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setPlaybackTime(0)
    setDuration(0)
    setIsRecording(false)
    setIsPlaying(false)

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center space-y-4">
        {/* Recording Status */}
        <div className="h-16 flex items-center justify-center">
          {isRecording ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-mono text-red-600">Recording: {formatTime(recordingTime)}</span>
            </div>
          ) : audioBlob ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-lg font-mono text-green-600">
                {isPlaying ? `Playing: ${formatTime(playbackTime)}` : `Ready: ${formatTime(duration)}`}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-lg font-mono text-gray-600">Ready to record</span>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          {!audioBlob ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full ${
                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-indigo-500 hover:bg-indigo-600"
              } text-white`}
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
          ) : (
            <>
              <Button
                onClick={isPlaying ? pauseRecording : playRecording}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                onClick={resetRecording}
                className="w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          {!audioBlob
            ? isRecording
              ? "Click the square to stop recording"
              : "Click the microphone to start recording"
            : "Click play to listen or reset to record again"}
        </div>
      </div>
    </div>
  )
}
