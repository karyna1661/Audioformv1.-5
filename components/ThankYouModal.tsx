"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle, Copy, Twitter, Facebook } from "lucide-react"
import { toast } from "sonner"

interface ThankYouModalProps {
  onClose: () => void
  surveyTitle: string
  shareUrl: string
}

export function ThankYouModal({ onClose, surveyTitle, shareUrl }: ThankYouModalProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"))
  }

  const shareOnTwitter = () => {
    const text = `I just responded to "${surveyTitle}" survey. Share your voice too!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 -mx-6 -mt-6 mb-6"></div>
        <DialogHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl">Thank You!</DialogTitle>
          <DialogDescription className="text-base">
            Your response to "{surveyTitle}" has been submitted successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4 text-center">Share this survey with others:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center">
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={shareOnTwitter} className="flex items-center">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={shareOnFacebook} className="flex items-center">
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
