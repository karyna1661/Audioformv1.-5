"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, QrCode } from "lucide-react"
import { toast } from "sonner"
import { getSurveyResponseUrl } from "@/utils/url-utils"

interface ShareButtonProps {
  surveyId: string
  surveyTitle: string
  className?: string
}

export function ShareButton({ surveyId, surveyTitle, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const responseUrl = getSurveyResponseUrl(surveyId)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(responseUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy link")
    }
  }

  const toggleQR = () => {
    setShowQR(!showQR)
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1 h-12 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
        >
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>

        <Button
          onClick={toggleQR}
          variant="outline"
          className="h-12 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </div>

      {showQR && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-indigo-100 flex flex-col items-center">
          <div className="mb-2 text-sm font-medium text-gray-700">Scan to respond:</div>
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(responseUrl)}`}
              alt="QR Code"
              width={200}
              height={200}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">{surveyTitle}</div>
        </div>
      )}
    </div>
  )
}
