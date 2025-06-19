"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Mic } from "lucide-react"
import { theme } from "@/lib/theme/colors"

// Custom Microphone with Waveform Icon Component
function MicrophoneWaveIcon({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Mic className="h-5 w-5 text-white relative z-10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex space-x-0.5 opacity-60">
          <div className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const { toast } = useToast()
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async () => {
    // Reset error
    setError("")

    // Validate email
    if (!email) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to add to waitlist
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success state
      setIsSubmitted(true)

      // Show toast
      toast({
        title: "Success!",
        description: "You've been added to our waitlist.",
      })
    } catch (err) {
      console.error("Error joining waitlist:", err)
      setError("Failed to join waitlist. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="border-b border-indigo-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${theme.primary.gradient} rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}
          >
            <MicrophoneWaveIcon />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Audioform
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/demo">
            <Button
              variant="outline"
              className={`${theme.primary.border} ${theme.primary.text} hover:${theme.primary.bg}`}
            >
              Try Demo
            </Button>
          </Link>
          <Button onClick={() => setShowWaitlistModal(true)} className={theme.primary.gradient}>
            Join Waitlist
          </Button>
        </div>
      </div>

      <Dialog open={showWaitlistModal} onOpenChange={(open) => !isSubmitting && setShowWaitlistModal(open)}>
        <DialogContent className="sm:max-w-md">
          {!isSubmitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Join our waitlist</DialogTitle>
                <DialogDescription>
                  Be the first to know when Audioform launches. Get early access to all features.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="waitlist-email">Email</Label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWaitlistModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className={theme.primary.gradient}>
                  {isSubmitting ? "Submitting..." : "Join Waitlist"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <DialogTitle className="mb-2">You're on the list!</DialogTitle>
              <DialogDescription className="mb-6">
                We'll notify you at <span className="font-medium">{email}</span> when we launch.
              </DialogDescription>
              <p className="text-xs text-gray-500">© 2025 Audioform. All rights reserved.</p>
              <Button onClick={() => setShowWaitlistModal(false)} className={theme.primary.gradient}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}
