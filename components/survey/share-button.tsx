"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Share, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  shareUrl: string
  surveyTitle?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  showFarcaster?: boolean
}

export function ShareButton({
  shareUrl,
  surveyTitle,
  variant = "outline",
  size = "default",
  showFarcaster = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const handleShareOnFarcaster = () => {
    if (surveyTitle) {
      const text = encodeURIComponent(`Voice your thoughts on: "${surveyTitle}" 🎙️`)
      const url = encodeURIComponent(shareUrl)
      window.open(`https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`, "_blank")
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant={variant} size={size} onClick={handleCopyLink} className="flex-1">
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>

      {showFarcaster && (
        <Button variant={variant} size={size} onClick={handleShareOnFarcaster} className="flex-1">
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      )}
    </div>
  )
}
