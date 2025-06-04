"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Share2, X } from "lucide-react"
import { toast } from "sonner"

interface ThankYouModalProps {
  isOpen: boolean
  onClose: () => void
  surveyTitle?: string
  shareUrl?: string
  autoCloseDelay?: number
}

export function ThankYouModal({
  isOpen,
  onClose,
  surveyTitle = "Survey",
  shareUrl,
  autoCloseDelay = 8000,
}: ThankYouModalProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000)

  useEffect(() => {
    if (!isOpen) return

    setTimeLeft(autoCloseDelay / 1000)

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, autoCloseDelay, onClose])

  const handleCopyLink = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleShareOnFarcaster = () => {
    if (!shareUrl) return

    const text = encodeURIComponent(`Just shared my thoughts on "${surveyTitle}" - voice your opinion too!`)
    const url = encodeURIComponent(shareUrl)
    const farcasterUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`

    window.open(farcasterUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Thank You!
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-2">
          <div className="text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              Your voice response has been submitted successfully!
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Auto-closing in {timeLeft}s</p>
          </div>

          {shareUrl && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Share this survey:</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1 text-xs sm:text-sm">
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Copy Link
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareOnFarcaster}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Share on Farcaster
                </Button>
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full text-sm sm:text-base">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
