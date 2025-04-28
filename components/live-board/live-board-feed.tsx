"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Clip {
  id: string
  surveyId: string
  audioUrl: string
  email: string
  createdAt: string
  questionText?: string
}

interface LiveBoardFeedProps {
  eventId: string
  initialClips?: Clip[]
}

export function LiveBoardFeed({ eventId, initialClips = [] }: LiveBoardFeedProps) {
  const [clips, setClips] = useState<Clip[]>(initialClips)
  const [newClipHighlight, setNewClipHighlight] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Set up WebSocket connection
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/live/${eventId}/stream`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connection established")
    }

    ws.onmessage = (event) => {
      try {
        const newClip = JSON.parse(event.data)
        setClips((prevClips) => [newClip, ...prevClips])
        setNewClipHighlight(newClip.id)

        // Remove highlight after animation
        setTimeout(() => {
          setNewClipHighlight(null)
        }, 3000)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      // Fallback to polling if WebSocket fails
      startPolling()
    }

    ws.onclose = () => {
      console.log("WebSocket connection closed")
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [eventId])

  // Fallback polling mechanism
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startPolling = () => {
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/clips`)
        if (response.ok) {
          const data = await response.json()
          setClips(data)
        }
      } catch (error) {
        console.error("Error polling for clips:", error)
      }
    }, 5000)
  }

  return (
    <div className="w-full h-full">
      <h2 className="text-2xl font-bold mb-4">Live Responses</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 pr-4">
          {clips.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No responses yet. Responses will appear here in real-time.
            </p>
          ) : (
            clips.map((clip) => (
              <Card
                key={clip.id}
                className={`transition-all duration-500 ${newClipHighlight === clip.id ? "bg-blue-50 shadow-md" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{clip.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(clip.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {clip.questionText && <Badge variant="outline">{clip.questionText}</Badge>}
                  </div>
                  <div className="flex items-center mt-4">
                    <PlayPauseButton audioUrl={clip.audioUrl} className="mr-4" />
                    <div className="flex-1">
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
