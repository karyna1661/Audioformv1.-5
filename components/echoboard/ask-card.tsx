"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RecordButton } from "@/components/audio/record-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { AudioWaveformIcon as Waveform } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AskCardProps {
  channel: string
  onAskSubmit: (audioBlob: Blob, title: string) => Promise<void>
}

export function AskCard({ channel, onAskSubmit }: AskCardProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcriptPreview, setTranscriptPreview] = useState<string | null>(null)
  const [emotion, setEmotion] = useState<"happy" | "neutral" | "sad" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleRecordingStart = () => {
    setIsRecording(true)
  }

  const handleRecordingComplete = (blob: Blob) => {
    setIsRecording(false)
    setAudioBlob(blob)

    // Create URL for playback
    const url = URL.createObjectURL(blob)
    setAudioUrl(url)

    // Generate mock transcript preview (in a real app, this would use an API)
    const mockTranscripts = [
      "I think the feature that...",
      "My biggest frustration is when...",
      "I would love to see...",
      "The most important thing is...",
      "One thing I'd change is...",
    ]
    setTranscriptPreview(mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)])

    // Set mock emotion based on random selection (in a real app, this would analyze audio)
    const emotions: Array<"happy" | "neutral" | "sad"> = ["happy", "neutral", "sad"]
    setEmotion(emotions[Math.floor(Math.random() * emotions.length)])
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast({
        title: "Recording required",
        description: "Please record your question before submitting",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your question",
        variant: "destructive",
      })
      textareaRef.current?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      await onAskSubmit(audioBlob, title)

      // Reset form
      setTitle("")
      setAudioBlob(null)
      setAudioUrl(null)
      setTranscriptPreview(null)
      setEmotion(null)

      toast({
        title: "Question posted!",
        description: `Your question has been posted to #${channel}`,
      })
    } catch (error) {
      console.error("Error submitting question:", error)
      toast({
        title: "Error",
        description: "Failed to post your question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRerecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscriptPreview(null)
    setEmotion(null)
  }

  const getEmotionEmoji = () => {
    switch (emotion) {
      case "happy":
        return "😊"
      case "neutral":
        return "😐"
      case "sad":
        return "😟"
      default:
        return null
    }
  }

  return (
    <Card className="w-full mb-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4">
          <Textarea
            ref={textareaRef}
            placeholder={`Ask a question in #${channel}... (e.g. What feature frustrates you most?)`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="resize-none text-lg"
            rows={2}
          />
        </div>

        {!audioBlob ? (
          <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center">
            <div className="mb-4 text-center">
              <Waveform className="h-12 w-12 text-slate-400 mb-2" />
              <p className="text-muted-foreground">Record your question to start a conversation</p>
            </div>
            <RecordButton
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
              className="w-full max-w-xs"
            />
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PlayPauseButton audioUrl={audioUrl || ""} className="mr-4" />
                {transcriptPreview && <div className="text-sm text-muted-foreground">"{transcriptPreview}"</div>}
              </div>
              {emotion && (
                <div className="text-2xl" title="Emotional tone">
                  {getEmotionEmoji()}
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleRerecord} disabled={isSubmitting}>
                Re-record
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Question"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
