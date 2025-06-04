"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Share2, ExternalLink, QrCode } from "lucide-react"
import { toast } from "sonner"
import { QRCodeModal } from "./qr-code-modal"

interface ShareButtonProps {
  surveyId: string
  surveyTitle: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function ShareButton({
  surveyId,
  surveyTitle,
  className,
  variant = "outline",
  size = "default",
}: ShareButtonProps) {
  const [showQR, setShowQR] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/respond/${surveyId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Survey link copied!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleShareOnFarcaster = () => {
    const text = encodeURIComponent(`Voice your thoughts on "${surveyTitle}" 🎙️`)
    const url = encodeURIComponent(shareUrl)
    const farcasterUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`

    window.open(farcasterUrl, "_blank", "noopener,noreferrer")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyTitle,
          text: "Voice your thoughts on this survey",
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled")
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Share</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 sm:w-48">
          <DropdownMenuItem onClick={handleCopyLink} className="text-sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleShareOnFarcaster} className="text-sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Share on Farcaster
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowQR(true)} className="text-sm">
            <QrCode className="h-4 w-4 mr-2" />
            Show QR Code
          </DropdownMenuItem>

          {navigator.share && (
            <DropdownMenuItem onClick={handleNativeShare} className="text-sm">
              <Share2 className="h-4 w-4 mr-2" />
              Native Share
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <QRCodeModal isOpen={showQR} onClose={() => setShowQR(false)} url={shareUrl} title={surveyTitle} />
    </>
  )
}
