"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Share } from "lucide-react"
import { toast } from "sonner"

interface ThankYouModalProps {
  onClose: () => void
  surveyTitle: string
  shareUrl: string
}

export function ThankYouModal({ onClose, surveyTitle, shareUrl }: ThankYouModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("Failed to copy link")
    }
  }

  const shareToFarcaster = () => {
    const text = `Just responded to "${surveyTitle}" - add your voice too! 🎤`
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`
    window.open(farcasterUrl, "_blank")
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span>Thank You!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600">
            Your voice response has been submitted successfully. Thank you for sharing your thoughts!
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Share this survey:</p>
            <div className="flex space-x-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              <Button onClick={shareToFarcaster} variant="outline" size="sm" className="flex-1">
                <Share className="h-4 w-4 mr-2" />
                Share on Farcaster
              </Button>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
