"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DemoExpiryModal } from "./demo-expiry-modal"
import { ExpirationStatus } from "./expiration-status"
import { ExpirationNotification } from "./expiration-notification"
import { useAnalytics } from "@/contexts/analytics-context"

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

interface SessionStatus {
  exists: boolean
  isExpired?: boolean
  isActive?: boolean
  expiresAt?: string
  notified?: boolean
}

interface DemoDashboardProps {
  surveyId: string
  title: string
  questions: Question[]
  responses: Response[]
  createdAt: string
  expiresAt: string
  sessionStatus?: SessionStatus | null
}

export function DemoDashboard({
  surveyId,
  title,
  questions,
  responses,
  createdAt,
  expiresAt,
  sessionStatus,
}: DemoDashboardProps) {
  const [isExpired, setIsExpired] = useState(false)
  const [showExpiryModal, setShowExpiryModal] = useState(false)
  const [shareTooltip, setShareTooltip] = useState(false)
  const { trackEvent } = useAnalytics()

  // Track dashboard view
  useEffect(() => {
    trackEvent("demo_viewed", { survey_id: surveyId, response_count: responses.length })

    // If this is the first response, track the event
    if (responses.length === 1) {
      trackEvent("responses_received", { survey_id: surveyId })
    }
  }, [trackEvent, surveyId, responses.length])

  // Check if the survey is expired based on props or session status
  useEffect(() => {
    const now = new Date()
    const expiry = new Date(expiresAt)

    if (sessionStatus?.isExpired || now >= expiry) {
      setIsExpired(true)
    }
  }, [expiresAt, sessionStatus])

  const handleShare = () => {
    // Generate the correct share URL for respondents
    const shareUrl = `${window.location.origin}/respond/demo/${surveyId}`
    navigator.clipboard.writeText(shareUrl)
    setShareTooltip(true)
    setTimeout(() => setShareTooltip(false), 2000)

    // Track share event
    trackEvent("demo_shared", { survey_id: surveyId, share_method: "clipboard" })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Demo Survey Dashboard</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <ExpirationStatus
            expiresAt={sessionStatus?.expiresAt || expiresAt}
            isExpired={sessionStatus?.isExpired || isExpired}
          />
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

      {sessionStatus && sessionStatus.exists && (
        <ExpirationNotification
          surveyId={surveyId}
          expiresAt={sessionStatus.expiresAt || expiresAt}
          notified={sessionStatus.notified || false}
        />
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
                          <PlayPauseButton
                            audioUrl={response.audioUrl}
                            className="mr-4"
                            disabled={isExpired}
                            onPlay={() =>
                              trackEvent("audio_played", {
                                survey_id: surveyId,
                                question_id: question.id,
                                response_id: response.id,
                              })
                            }
                          />
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
