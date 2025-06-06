"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Share2 } from "lucide-react"
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
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 absolute top-0 left-0 right-0 rounded-t-lg"></div>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-indigo-600" />
            <span>Thank You!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <p className="text-indigo-900">
              Your voice response has been submitted successfully. Thank you for sharing your thoughts!
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Share this survey:</p>
            <div className="flex space-x-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex-1 border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              <Button
                onClick={shareToFarcaster}
                variant="outline"
                size="sm"
                className="flex-1 border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share on Farcaster
              </Button>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
