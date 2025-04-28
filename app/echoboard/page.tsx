"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { AskCard } from "@/components/echoboard/ask-card"
import { ThreadGrid } from "@/components/echoboard/thread-grid"
import { ChannelPills } from "@/components/echoboard/channel-pills"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
const mockChannels = ["general", "ux", "development", "marketing", "design", "product"]

const mockThreads = [
  {
    threadId: "thread1",
    channel: "general",
    title: "What's your favorite productivity tool?",
    askClipId: "clip1",
    audioUrl: "https://example.com/audio1.mp3",
    echoes: 15,
    mutes: 2,
    replyCount: 1,
    createdBy: {
      id: "user1",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      badges: ["Top Contributor"],
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    threadId: "thread2",
    channel: "ux",
    title: "How do you handle user testing for mobile apps?",
    askClipId: "clip3",
    audioUrl: "https://example.com/audio3.mp3",
    echoes: 22,
    mutes: 1,
    replyCount: 0,
    createdBy: {
      id: "user3",
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      badges: ["UX Expert"],
    },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    threadId: "thread3",
    channel: "general",
    title: "What's your approach to work-life balance?",
    askClipId: "clip4",
    audioUrl: "https://example.com/audio4.mp3",
    echoes: 18,
    mutes: 3,
    replyCount: 2,
    createdBy: {
      id: "user4",
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
]

export default function EchoBoardPage() {
  const { toast } = useToast()
  const [channels] = useState(mockChannels)
  const [activeChannel, setActiveChannel] = useState("general")
  const [threads, setThreads] = useState(mockThreads)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("trending")

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleChannelChange = (channel: string) => {
    setActiveChannel(channel)
  }

  const handleAskSubmit = async (audioBlob: Blob, title: string) => {
    // In a real app, this would upload the audio and create a new thread
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new thread
      const newThread = {
        threadId: `thread${Date.now()}`,
        channel: activeChannel,
        title,
        askClipId: `clip${Date.now()}`,
        audioUrl: URL.createObjectURL(audioBlob),
        echoes: 0,
        mutes: 0,
        replyCount: 0,
        createdBy: {
          id: "currentUser",
          name: "Current User",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: new Date().toISOString(),
      }

      setThreads([newThread, ...threads])
      return Promise.resolve()
    } catch (error) {
      console.error("Error creating thread:", error)
      return Promise.reject(error)
    }
  }

  const handleReply = async (threadId: string, audioBlob: Blob) => {
    // In a real app, this would upload the audio and add a reply
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update thread with new reply count
      const updatedThreads = threads.map((thread) => {
        if (thread.threadId === threadId) {
          return {
            ...thread,
            replyCount: thread.replyCount + 1,
          }
        }
        return thread
      })

      setThreads(updatedThreads)
      return Promise.resolve()
    } catch (error) {
      console.error("Error adding reply:", error)
      return Promise.reject(error)
    }
  }

  const handleEcho = async (threadId: string, clipId: string) => {
    // In a real app, this would call an API to echo the clip
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update thread with new echo count
      const updatedThreads = threads.map((thread) => {
        if (thread.threadId === threadId) {
          return {
            ...thread,
            echoes: thread.echoes + 1,
          }
        }
        return thread
      })

      setThreads(updatedThreads)
      return Promise.resolve()
    } catch (error) {
      console.error("Error echoing clip:", error)
      return Promise.reject(error)
    }
  }

  const handleMute = async (threadId: string, clipId: string) => {
    // In a real app, this would call an API to mute the clip
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update thread with new mute count
      const updatedThreads = threads.map((thread) => {
        if (thread.threadId === threadId) {
          return {
            ...thread,
            mutes: thread.mutes + 1,
          }
        }
        return thread
      })

      setThreads(updatedThreads)
      return Promise.resolve()
    } catch (error) {
      console.error("Error muting clip:", error)
      return Promise.reject(error)
    }
  }

  // Filter threads based on active channel and tab
  const filteredThreads = threads
    .filter((thread) => {
      // Filter by channel
      if (thread.channel !== activeChannel) return false

      // Filter by tab
      if (activeTab === "trending") {
        // Sort by most echoes
        return true
      } else if (activeTab === "recent") {
        // Sort by most recent
        return true
      } else if (activeTab === "unanswered") {
        // Filter to threads with no replies
        return thread.replyCount === 0
      }

      return true
    })
    .sort((a, b) => {
      if (activeTab === "trending") {
        // Sort by most echoes
        return b.echoes - a.echoes
      } else {
        // Sort by most recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">EchoBoard</h1>
            <p className="text-muted-foreground">Community-driven audio Q&A forum</p>
          </div>
        </div>

        <div className="mb-6">
          <ChannelPills channels={channels} activeChannel={activeChannel} onSelectChannel={handleChannelChange} />
        </div>

        <AskCard channel={activeChannel} onAskSubmit={handleAskSubmit} />

        <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading threads...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-slate-50">
            <p className="text-muted-foreground mb-6">
              No threads found in #{activeChannel}. Be the first to ask a question!
            </p>
          </div>
        ) : (
          <ThreadGrid threads={filteredThreads} onReply={handleReply} onEcho={handleEcho} onMute={handleMute} />
        )}
      </main>
    </div>
  )
}
