"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface QRCodeModalProps {
  eventName: string
  eventSlug: string
  qrCodeUrl: string
}

export function QRCodeModal({ eventName, eventSlug, qrCodeUrl }: QRCodeModalProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const eventUrl = `${window.location.origin}/event/${eventSlug}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(eventUrl)
    toast({
      title: "URL Copied!",
      description: "Event URL has been copied to clipboard.",
      duration: 3000,
    })
  }

  const handleDownloadQR = () => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `${eventSlug}-qrcode.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
          <DialogDescription>Share this QR code for easy access to your event: {eventName}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="border p-2 rounded-md bg-white">
            <Image
              src={qrCodeUrl || "/placeholder.svg"}
              alt={`QR Code for ${eventName}`}
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <p className="mt-4 text-sm text-center break-all">{eventUrl}</p>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={handleDownloadQR}>
            Download QR
          </Button>
          <Button onClick={handleCopyUrl}>Copy URL</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
