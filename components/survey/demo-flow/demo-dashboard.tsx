"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { Badge } from "@/components/ui/badge"
import { Clock, Share2, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DemoExpiryModal } from "./demo-expiry-modal"

interface Response {
  id: string
  questionId: string
  audioUrl: string
  email: string
  createdAt: string
}

interface Question {
  id: string
  text: string
}

interface DemoDashboardProps {
  surveyId: string
  title: string
  questions: Question[]
  responses: Response[]
  createdAt: string
  expiresAt: string
}

export function DemoDashboard({ surveyId, title, questions, responses, createdAt, expiresAt }: DemoDashboardProps) {
  const [isExpired, setIsExpired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [showExpiryModal, setShowExpiryModal] = useState(false)
  const [shareTooltip, setShareTooltip] = useState(false)

  // Check if the survey is expired
  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date()
      const expiry = new Date(expiresAt)

      if (now >= expiry) {
        setIsExpired(true)
        setTimeRemaining("Expired")
      } else {
        setIsExpired(false)
        setTimeRemaining(formatDistanceToNow(expiry, { addSuffix: false }))
      }
    }

    // Initial check
    checkExpiry()

    // Set up interval to update time remaining
    const interval = setInterval(checkExpiry, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  // Show expiry modal if expired
  useEffect(() => {
    if (isExpired) {
      setShowExpiryModal(true)
    }
  }, [isExpired])

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/respond/demo/${surveyId}`
    navigator.clipboard.writeText(shareUrl)
    setShareTooltip(true)
    setTimeout(() => setShareTooltip(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Demo Survey Dashboard</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <Badge variant="outline" className={`flex items-center gap-1 ${isExpired ? "bg-red-50 text-red-800" : ""}`}>
            <Clock className="h-3 w-3" />
            {isExpired ? "Expired" : `${timeRemaining} remaining`}
          </Badge>
          <div className="relative">
            <Button onClick={handleShare} disabled={isExpired}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Survey
            </Button>
            {shareTooltip && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                Link copied!
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpired && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-medium">This demo survey has expired</p>
              <p className="text-sm text-muted-foreground">
                Join our waitlist to keep access to your responses and create unlimited surveys.
              </p>
            </div>
            <Button className="ml-auto" onClick={() => setShowExpiryModal(true)}>
              Join Waitlist
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {questions.map((question) => {
          const questionResponses = responses.filter((r) => r.questionId === question.id)

          return (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl">{question.text}</CardTitle>
              </CardHeader>
              <CardContent>
                {questionResponses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No responses yet for this question.</p>
                    {!isExpired && (
                      <Button variant="outline" className="mt-4" onClick={handleShare}>
                        Share to get responses
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questionResponses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium">{response.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <PlayPauseButton audioUrl={response.audioUrl} className="mr-4" disabled={isExpired} />
                          <div className="flex-1">
                            <div className="h-2 bg-slate-100 rounded-full">
                              <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showExpiryModal && <DemoExpiryModal isOpen={showExpiryModal} onClose={() => setShowExpiryModal(false)} />}
    </div>
  )
}
