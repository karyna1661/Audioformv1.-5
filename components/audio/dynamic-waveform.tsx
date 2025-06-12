"use client"

import { useEffect, useRef, useState } from "react"

interface DynamicWaveformProps {
  audioUrl?: string
  isPlaying: boolean
  isRecording?: boolean
  className?: string
}

export function DynamicWaveform({ audioUrl, isPlaying, isRecording = false, className = "" }: DynamicWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number>()
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  // Static bars for when not playing
  const staticBars = Array.from({ length: 40 }, (_, i) => Math.max(15, Math.min(100, 30 + Math.sin(i * 0.5) * 70)))

  useEffect(() => {
    if (audioUrl && !audioElement) {
      const audio = new Audio(audioUrl)
      audio.crossOrigin = "anonymous"
      setAudioElement(audio)
    }
  }, [audioUrl, audioElement])

  useEffect(() => {
    if (!audioElement || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const setupAudioContext = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        if (!sourceRef.current && audioElement) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
          analyserRef.current = audioContextRef.current.createAnalyser()
          analyserRef.current.fftSize = 256

          sourceRef.current.connect(analyserRef.current)
          analyserRef.current.connect(audioContextRef.current.destination)
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume()
        }

        drawWaveform()
      } catch (error) {
        console.error("Error setting up audio context:", error)
      }
    }

    setupAudioContext()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioElement, isPlaying])

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / 40
      const maxHeight = canvas.height - 10

      for (let i = 0; i < 40; i++) {
        const dataIndex = Math.floor((i / 40) * bufferLength)
        const barHeight = Math.max(8, (dataArray[dataIndex] / 255) * maxHeight)

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, "#6366f1") // indigo-500
        gradient.addColorStop(0.5, "#8b5cf6") // violet-500
        gradient.addColorStop(1, "#a855f7") // purple-500

        ctx.fillStyle = gradient
        ctx.fillRect(i * barWidth + 2, canvas.height - barHeight, barWidth - 4, barHeight)
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
  }

  const drawStaticWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const barWidth = canvas.width / 40
    const maxHeight = canvas.height - 10

    staticBars.forEach((height, i) => {
      const barHeight = (height / 100) * maxHeight

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
      if (isRecording) {
        gradient.addColorStop(0, "#6366f1")
        gradient.addColorStop(0.5, "#8b5cf6")
        gradient.addColorStop(1, "#a855f7")
      } else {
        gradient.addColorStop(0, "#e2e8f0") // slate-200
        gradient.addColorStop(0.5, "#cbd5e1") // slate-300
        gradient.addColorStop(1, "#94a3b8") // slate-400
      }

      ctx.fillStyle = gradient
      ctx.fillRect(i * barWidth + 2, canvas.height - barHeight, barWidth - 4, barHeight)
    })
  }

  useEffect(() => {
    if (!isPlaying) {
      drawStaticWaveform()
    }
  }, [isPlaying, isRecording])

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={320}
        height={60}
        className="w-full h-full rounded-md"
        style={{ maxWidth: "100%", height: "60px" }}
      />
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
