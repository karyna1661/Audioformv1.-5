"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2, Copy, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { createSurveyUrl } from "@/lib/utils/url"
import { useFarcasterShare } from "@/hooks/useFarcasterShare"

interface ShareButtonProps {
  surveyId: string
  surveyTitle?: string
}

export function ShareButton({ surveyId, surveyTitle = "Check out this survey" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { shareToFarcaster, isSharing } = useFarcasterShare()

  const surveyUrl = createSurveyUrl(surveyId)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl)
      toast.success("Survey link copied to clipboard!")
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      toast.error("Failed to copy link")
    }
  }

  const handleFarcasterShare = async () => {
    const result = await shareToFarcaster({
      text: `${surveyTitle} - Share your thoughts!`,
      url: surveyUrl,
    })

    if (result.success) {
      toast.success("Opening Farcaster...")
      setIsOpen(false)
    } else {
      toast.error("Failed to share to Farcaster")
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share Survey
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFarcasterShare} disabled={isSharing}>
          <MessageCircle className="h-4 w-4 mr-2" />
          {isSharing ? "Sharing..." : "Share on Farcaster"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
