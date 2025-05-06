"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"
import { useAnalytics } from "@/contexts/analytics-context"

interface DemoExpiryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoExpiryModal({ isOpen, onClose }: DemoExpiryModalProps) {
  const { toast } = useToast()
  const { trackEvent } = useAnalytics()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Track modal open
  useState(() => {
    if (isOpen) {
      trackEvent("waitlist_modal_opened")
    }
  })

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

      // Track waitlist signup
      await trackEvent("waitlist_joined", { email })

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

      // Track error
      await trackEvent("waitlist_error", { email, error: (err as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Join our waitlist</DialogTitle>
              <DialogDescription>
                Your demo survey has expired. Join our waitlist to keep access to your responses and get notified when
                we launch.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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
              <Button
                variant="outline"
                onClick={() => {
                  trackEvent("waitlist_dismissed")
                  onClose()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
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
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
