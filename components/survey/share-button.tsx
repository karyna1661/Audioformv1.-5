"use client"

import { useState } from "react"
import { ThemedButton } from "@/components/ui/themed-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2, Copy, MessageCircle, QrCode, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { createSurveyUrl } from "@/lib/utils/url"
import { FarcasterShare } from "@/lib/farcaster/share"
import { ClipboardManager } from "@/lib/utils/clipboard"

interface ShareButtonProps {
  surveyId: string
  surveyTitle?: string
  className?: string
}

export function ShareButton({ surveyId, surveyTitle = "Voice Survey", className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const surveyUrl = createSurveyUrl(surveyId)

  const handleCopyToClipboard = async () => {
    try {
      const result = await ClipboardManager.copyText(surveyUrl)

      if (result.success) {
        setCopied(true)
        toast.success("Survey link copied to clipboard!", {
          description: "Share this link with your audience to collect responses",
          duration: 3000,
        })

        setTimeout(() => setCopied(false), 3000)
      } else {
        throw new Error(result.error || "Failed to copy")
      }

      setIsOpen(false)
    } catch (error) {
      console.error("Clipboard copy failed:", error)
      toast.error("Failed to copy link", {
        description: "Please copy the URL manually from your browser",
      })
    }
  }

  const handleFarcasterShare = async () => {
    setIsSharing(true)

    try {
      const shareContent = FarcasterShare.createSurveyShareContent(surveyTitle, surveyUrl)
      const result = await FarcasterShare.share(shareContent)

      if (result.success) {
        toast.success("Opening Farcaster...", {
          description: "Share your survey with the Farcaster community",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Failed to share")
      }

      setIsOpen(false)
    } catch (error) {
      console.error("Farcaster share failed:", error)
      toast.error("Failed to share on Farcaster", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleQRCodeGeneration = () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(surveyUrl)}`
      window.open(qrUrl, "_blank", "width=500,height=500")

      toast.success("QR code generated!", {
        description: "Use this QR code for easy mobile sharing",
      })

      setIsOpen(false)
    } catch (error) {
      console.error("QR code generation failed:", error)
      toast.error("Failed to generate QR code")
    }
  }

  const handleDirectLink = () => {
    window.open(surveyUrl, "_blank")
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <ThemedButton variant="outline" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Survey
        </ThemedButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer">
          {copied ? <Check className="h-4 w-4 mr-2 text-green-600" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied!" : "Copy Link to Clipboard"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleFarcasterShare} className="cursor-pointer" disabled={isSharing}>
          <MessageCircle className="h-4 w-4 mr-2" />
          {isSharing ? "Sharing..." : "Share on Farcaster"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleQRCodeGeneration} className="cursor-pointer">
          <QrCode className="h-4 w-4 mr-2" />
          Generate QR Code
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDirectLink} className="cursor-pointer">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Survey Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
