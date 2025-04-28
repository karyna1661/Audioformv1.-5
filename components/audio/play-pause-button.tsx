"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayPauseButtonProps {
  audioUrl: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function PlayPauseButton({
  audioUrl,
  className,
  variant = "outline",
  size = "icon",
  onPlay,
  onPause,
  onEnded,
}: PlayPauseButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio(audioUrl)
    audio.crossOrigin = "anonymous"
    audioRef.current = audio

    // Set up event listeners
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      // Clean up
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.pause()

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioUrl])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(currentProgress)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
    if (onEnded) onEnded()

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const setupAudioVisualization = () => {
    if (!audioRef.current) return

    // Create audio context if it doesn't exist
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
    }

    // Create analyser if it doesn't exist
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
    }

    // Create source if it doesn't exist
    if (!sourceRef.current && audioRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    }

    // Start visualization
    drawWaveform()
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser || !isPlaying) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying) return

      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        ctx.fillStyle = `rgb(${barHeight + 100}, 100, 200)`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (onPause) onPause()

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    } else {
      audioRef.current.play()
      setIsPlaying(true)
      if (onPlay) onPlay()

      setupAudioVisualization()
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Button onClick={togglePlayPause} variant={variant} size={size} className={cn(isPlaying && "bg-slate-200")}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      {isPlaying && (
        <div className="mt-2 w-full h-8 bg-slate-100 rounded-md overflow-hidden">
          <canvas ref={canvasRef} width={300} height={32} className="w-full h-full" />
        </div>
      )}

      <div className="w-full mt-1 bg-slate-200 rounded-full h-1.5">
        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
