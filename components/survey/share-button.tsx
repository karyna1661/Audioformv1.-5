"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from 'lucide-react'
import { toast } from "sonner"

interface ShareButtonProps {
  surveyId: string
  surveyTitle: string
  className?: string
}

export function ShareButton({ surveyId, surveyTitle, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Use the correct domain
    const baseUrl = "https://voxera.vercel.app"
    const shareUrl = `${baseUrl}/respond/${surveyId.trim()}`

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
    <Button 
      onClick={handleShare} 
      className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white ${className}`}
    >
      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
      {copied ? "Copied!" : "Copy Survey Link"}
    </Button>
  )
}

export default ShareButton
