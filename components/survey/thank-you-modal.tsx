"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Share } from "lucide-react"
import { toast } from "sonner"

interface ThankYouModalProps {
  isOpen: boolean
  onClose: () => void
  surveyTitle?: string
  shareUrl?: string
}

export function ThankYouModal({ isOpen, onClose, surveyTitle, shareUrl }: ThankYouModalProps) {
  const [autoCloseTimer, setAutoCloseTimer] = useState(8)

  useEffect(() => {
    if (isOpen && autoCloseTimer > 0) {
      const timer = setTimeout(() => {
        setAutoCloseTimer((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (autoCloseTimer === 0) {
      onClose()
    }
  }, [isOpen, autoCloseTimer, onClose])

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      } catch (err) {
        toast.error("Failed to copy link")
      }
    }
  }

  const handleShareOnFarcaster = () => {
    if (shareUrl && surveyTitle) {
      const text = encodeURIComponent(`Just shared my thoughts on: "${surveyTitle}" 🎙️\n\nVoice your opinion too:`)
      const url = encodeURIComponent(shareUrl)
      window.open(`https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">Thank You!</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your voice response has been submitted successfully.
            {surveyTitle && ` Thank you for sharing your thoughts on "${surveyTitle}".`}
          </p>

          {shareUrl && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Share this survey with others:</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareOnFarcaster} className="flex-1">
                  <Share className="mr-2 h-4 w-4" />
                  Share on Farcaster
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">Auto-closing in {autoCloseTimer}s</p>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
