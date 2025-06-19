"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { createResponseUrl, validateUrl, debugUrl } from "@/lib/utils/url"

interface ShareButtonProps {
  surveyId: string
  surveyTitle: string
  className?: string
}

export function ShareButton({ surveyId, surveyTitle, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleShare = async () => {
    try {
      const shareUrl = createResponseUrl(surveyId)
      debugUrl(shareUrl)

      if (!validateUrl(shareUrl)) {
        toast.error("Generated URL is invalid")
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Survey link copied to clipboard!")

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error(`Failed to copy link: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleTest = async () => {
    try {
      setTesting(true)
      const shareUrl = createResponseUrl(surveyId)

      console.log("Testing URL:", shareUrl)

      // Test URL accessibility
      const response = await fetch(shareUrl, {
        method: "HEAD",
        mode: "no-cors", // Avoid CORS issues for testing
      })

      console.log("URL test response:", response.status)

      if (response.status === 200 || response.type === "opaque") {
        toast.success("Survey link is accessible!")
        // Open in new tab
        window.open(shareUrl, "_blank")
      } else {
        toast.error(`Survey link returned status: ${response.status}`)
      }
    } catch (error) {
      console.error("URL test error:", error)
      toast.error("Could not test URL accessibility")
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleShare}
        className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white ${className}`}
      >
        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? "Copied!" : "Copy Survey Link"}
      </Button>

      <Button
        onClick={handleTest}
        disabled={testing}
        variant="outline"
        className="border-indigo-200 hover:bg-indigo-50 text-indigo-600"
      >
        {testing ? (
          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        ) : (
          <ExternalLink className="w-4 h-4 mr-2" />
        )}
        Test Link
      </Button>
    </div>
  )
}

export default ShareButton
