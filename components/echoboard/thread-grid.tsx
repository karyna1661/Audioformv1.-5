"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { EchoButton } from "./echo-button"
import { MessageSquare, Award } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RecordButton } from "@/components/audio/record-button"
import { useToast } from "@/hooks/use-toast"

interface Thread {
  threadId: string
  channel: string
  title: string
  askClipId: string
  audioUrl: string
  echoes: number
  mutes: number
  replyCount: number
  createdBy: {
    id: string
    name: string
    avatar?: string
    badges?: string[]
  }
  createdAt: string
}

interface ThreadGridProps {
  threads: Thread[]
  onReply: (threadId: string, audioBlob: Blob) => Promise<void>
  onEcho: (threadId: string, clipId: string) => Promise<void>
  onMute: (threadId: string, clipId: string) => Promise<void>
}

export function ThreadGrid({ threads, onReply, onEcho, onMute }: ThreadGridProps) {
  const { toast } = useToast()
  const [replyingTo, setReplyingTo] = useState<Thread | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredThread, setHoveredThread] = useState<string | null>(null)

  const handleReplyClick = (thread: Thread) => {
    setReplyingTo(thread)
  }

  const handleReplySubmit = async (audioBlob: Blob) => {
    if (!replyingTo) return

    setIsSubmitting(true)

    try {
      await onReply(replyingTo.threadId, audioBlob)

      // Close dialog and show success message
      setReplyingTo(null)
      toast({
        title: "Reply posted!",
        description: "Your response has been added to the thread.",
      })
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEcho = async (threadId: string, clipId: string) => {
    try {
      await onEcho(threadId, clipId)
    } catch (error) {
      console.error("Error echoing clip:", error)
      toast({
        title: "Error",
        description: "Failed to echo this clip. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMute = async (threadId: string, clipId: string) => {
    if (window.confirm("Are you sure you want to mute this clip?")) {
      try {
        await onMute(threadId, clipId)
      } catch (error) {
        console.error("Error muting clip:", error)
        toast({
          title: "Error",
          description: "Failed to mute this clip. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {threads.map((thread) => (
          <Card
            key={thread.threadId}
            className="overflow-hidden hover:shadow-md transition-shadow duration-200"
            onMouseEnter={() => setHoveredThread(thread.threadId)}
            onMouseLeave={() => setHoveredThread(null)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={thread.createdBy.avatar || "/placeholder.svg"} alt={thread.createdBy.name} />
                    <AvatarFallback>{thread.createdBy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{thread.createdBy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">#{thread.channel}</Badge>
              </div>

              <h3 className="font-medium mb-3 line-clamp-2">{thread.title}</h3>

              <div className="mb-4">
                <PlayPauseButton
                  audioUrl={thread.audioUrl}
                  className="w-full"
                  autoPlay={hoveredThread === thread.threadId}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <EchoButton count={thread.echoes} onClick={() => handleEcho(thread.threadId, thread.askClipId)} />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleMute(thread.threadId, thread.askClipId)}
                  >
                    🔇 Mute
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  {thread.createdBy.badges?.map((badge) => (
                    <div key={badge} className="flex items-center">
                      <Award className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-xs">{badge}</span>
                    </div>
                  ))}

                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm">{thread.replyCount} replies</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => handleReplyClick(thread)}>
                Respond to this
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!replyingTo} onOpenChange={(open) => !isSubmitting && !open && setReplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to: {replyingTo?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-muted-foreground">Record your response to this question</p>
            <RecordButton onRecordingComplete={handleReplySubmit} className="w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
