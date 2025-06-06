"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Share2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface ThankYouModalProps {
  onClose: () => void
  surveyTitle: string
  shareUrl: string
}

export function ThankYouModal({ onClose, surveyTitle, shareUrl }: ThankYouModalProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-[2px]">
            <div className="bg-white rounded-2xl h-full w-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8">
            {/* Header with Animation */}
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                <div className="relative bg-white rounded-full p-3">
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-purple-500 animate-bounce" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Thank You!
              </h2>

              <p className="text-gray-600 text-sm sm:text-base">Your voice has been heard</p>
            </div>

            {/* Success Message */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-6 border border-indigo-100">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-indigo-900 text-sm sm:text-base leading-relaxed">
                    Your voice response has been submitted successfully. Thank you for sharing your thoughts and
                    contributing to the conversation!
                  </p>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Help us grow</h3>
                <p className="text-sm text-gray-600 mb-4">Share this survey with others to collect more voices</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="h-12 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 transition-all duration-200"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy Link"}
                </Button>

                <Button
                  onClick={shareToFarcaster}
                  variant="outline"
                  className="h-12 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-600 transition-all duration-200"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share on Farcaster
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue Exploring
            </Button>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50 blur-xl"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
