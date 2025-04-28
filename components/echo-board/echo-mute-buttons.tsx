"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface EchoMuteButtonsProps {
  clipId: string
  initialEchoes: number
  initialMutes: number
  onVote: (clipId: string, voteType: "echo" | "mute") => Promise<{ newCount: number }>
}

export function EchoMuteButtons({ clipId, initialEchoes, initialMutes, onVote }: EchoMuteButtonsProps) {
  const [echoes, setEchoes] = useState(initialEchoes)
  const [mutes, setMutes] = useState(initialMutes)
  const [userVote, setUserVote] = useState<"echo" | "mute" | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType: "echo" | "mute") => {
    if (isVoting) return

    setIsVoting(true)

    try {
      // If user already voted the same way, treat as removing vote
      if (userVote === voteType) {
        // This would require a separate API endpoint in a real implementation
        // For now, we'll just toggle the state
        if (voteType === "echo") {
          setEchoes(echoes - 1)
        } else {
          setMutes(mutes - 1)
        }
        setUserVote(null)
      }
      // If user voted the opposite way, switch vote
      else if (userVote !== null) {
        const result = await onVote(clipId, voteType)

        if (voteType === "echo") {
          setEchoes(echoes + 1)
          setMutes(mutes - 1)
        } else {
          setMutes(mutes + 1)
          setEchoes(echoes - 1)
        }

        setUserVote(voteType)
      }
      // First time voting
      else {
        const result = await onVote(clipId, voteType)

        if (voteType === "echo") {
          setEchoes(echoes + 1)
        } else {
          setMutes(mutes + 1)
        }

        setUserVote(voteType)
      }
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center space-x-1", userVote === "echo" && "text-green-600")}
          onClick={() => handleVote("echo")}
          disabled={isVoting}
        >
          <ThumbsUp className={cn("h-4 w-4", userVote === "echo" && "fill-green-600")} />
          <span>{echoes}</span>
        </Button>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center space-x-1", userVote === "mute" && "text-red-600")}
          onClick={() => handleVote("mute")}
          disabled={isVoting}
        >
          <ThumbsDown className={cn("h-4 w-4", userVote === "mute" && "fill-red-600")} />
          <span>{mutes}</span>
        </Button>
      </div>
    </div>
  )
}
