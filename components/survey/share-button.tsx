"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  surveyId: string
  surveyTitle: string
  className?: string
}

export function ShareButton({ surveyId, surveyTitle, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Get the base URL from environment or current window
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")

    // Clean the base URL and create the share URL
    const cleanBaseUrl = baseUrl.trim().replace(/\/$/, "")
    const shareUrl = `${cleanBaseUrl}/respond/${surveyId.trim()}`

    console.log("Sharing URL:", shareUrl) // Debug log

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Survey link copied to clipboard!")

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("Failed to copy link")
    }
  }

  return (
    <Button onClick={handleShare} className={className}>
      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
      {copied ? "Copied!" : "Copy Survey Link"}
    </Button>
  )
}

export default ShareButton
