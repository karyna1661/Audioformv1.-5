"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, X } from "lucide-react"
import { getTimeRemaining } from "@/utils/date-utils"
import { markDemoSessionNotified } from "@/app/actions/demo-sessions"
import { DemoExpiryModal } from "./demo-expiry-modal"

interface ExpirationNotificationProps {
  surveyId: string
  expiresAt: string
  notified: boolean
}

export function ExpirationNotification({ surveyId, expiresAt, notified }: ExpirationNotificationProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(expiresAt))
  const [showNotification, setShowNotification] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(notified)

  useEffect(() => {
    // Update time remaining every minute
    const interval = setInterval(() => {
      const newTimeRemaining = getTimeRemaining(expiresAt)
      setTimeRemaining(newTimeRemaining)

      // Show notification if less than 3 hours remaining and not dismissed
      if (newTimeRemaining.isWarning && !dismissed) {
        setShowNotification(true)
      }

      // If expired and not notified, show the modal
      if (newTimeRemaining.isExpired && !notified) {
        setShowModal(true)
      }
    }, 60000)

    // Initial check
    if (timeRemaining.isWarning && !dismissed) {
      setShowNotification(true)
    }

    if (timeRemaining.isExpired && !notified) {
      setShowModal(true)
    }

    return () => clearInterval(interval)
  }, [expiresAt, dismissed, notified])

  const handleDismiss = async () => {
    setShowNotification(false)
    setDismissed(true)

    // Mark as notified in the database
    await markDemoSessionNotified(surveyId)
  }

  const handleJoinWaitlist = () => {
    setShowModal(true)
  }

  const handleCloseModal = async () => {
    setShowModal(false)

    // Mark as notified in the database
    await markDemoSessionNotified(surveyId)
  }

  if (!showNotification && !timeRemaining.isExpired) {
    return null
  }

  if (timeRemaining.isExpired) {
    return (
      <>
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-medium">This demo survey has expired</p>
              <p className="text-sm text-muted-foreground">
                Join our waitlist to keep access to your responses and create unlimited surveys.
              </p>
            </div>
            <Button className="ml-auto flex-shrink-0" onClick={handleJoinWaitlist}>
              Join Waitlist
            </Button>
          </CardContent>
        </Card>

        {showModal && <DemoExpiryModal isOpen={showModal} onClose={handleCloseModal} />}
      </>
    )
  }

  return (
    <>
      <Card className="bg-amber-50 border-amber-200 mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <Clock className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div className="flex-grow">
            <p className="font-medium">Your demo survey is expiring soon</p>
            <p className="text-sm text-muted-foreground">
              {timeRemaining.hours > 0 && `${timeRemaining.hours} hours `}
              {timeRemaining.minutes > 0 && `${timeRemaining.minutes} minutes `}
              remaining. Join our waitlist to keep access to your responses.
            </p>
          </div>
          <Button variant="outline" size="icon" className="flex-shrink-0" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
