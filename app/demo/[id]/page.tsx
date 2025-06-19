"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RealTimeCounter } from "@/components/survey/real-time-counter"
import { ShareButton } from "@/components/survey/share-button"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, MessageSquare, Share2, Calendar, BarChart3 } from "lucide-react"

interface MockResponse {
  id: string
  questionId: string
  audioUrl: string
  email: string
  createdAt: string
}

interface MockSurvey {
  id: string
  title: string
  questions: Array<{ id: string; text: string }>
  responses: MockResponse[]
  createdAt: string
  expiresAt: string
}

export default function DemoDashboardPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [survey, setSurvey] = useState<MockSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [responseCount, setResponseCount] = useState(0)

  useEffect(() => {
    // Simulate loading survey data
    const loadSurvey = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockSurvey: MockSurvey = {
          id: params.id,
          title: "Customer Feedback Demo",
          questions: [
            { id: "q1", text: "How would you rate your overall experience?" },
            { id: "q2", text: "What features do you find most valuable?" },
            { id: "q3", text: "How can we improve our service?" },
          ],
          responses: [
            {
              id: "r1",
              questionId: "q1",
              audioUrl: "/placeholder-audio.mp3",
              email: "user1@example.com",
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            },
            {
              id: "r2",
              questionId: "q2",
              audioUrl: "/placeholder-audio.mp3",
              email: "user2@example.com",
              createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
        }

        setSurvey(mockSurvey)
        setResponseCount(mockSurvey.responses.length)
      } catch (error) {
        console.error("Error loading survey:", error)
        toast({
          title: "Error",
          description: "Failed to load survey data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [params.id, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const diff = expiry - now

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Survey Not Found</h2>
            <p className="text-gray-600">The requested survey could not be found.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Survey Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {survey.title}
              </h1>
              <p className="text-gray-600 mt-2">Demo Survey Dashboard</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Active Demo
            </Badge>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created {formatDate(survey.createdAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {getTimeRemaining(survey.expiresAt)}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Total Responses</p>
                  <p className="text-2xl font-bold text-indigo-700">{responseCount}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Questions</p>
                  <p className="text-2xl font-bold text-purple-700">{survey.questions.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-700">85%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <RealTimeCounter surveyId={survey.id} />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Share Survey
              </CardTitle>
              <CardDescription>Share your survey to collect responses</CardDescription>
            </CardHeader>
            <CardContent>
              <ShareButton surveyId={survey.id} title={survey.title} />
            </CardContent>
          </Card>
        </div>

        {/* Questions and Responses */}
        <div className="space-y-6">
          {survey.questions.map((question, index) => {
            const questionResponses = survey.responses.filter((r) => r.questionId === question.id)

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    {question.text}
                  </CardTitle>
                  <CardDescription>
                    {questionResponses.length} response{questionResponses.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questionResponses.length > 0 ? (
                    <div className="space-y-4">
                      {questionResponses.map((response) => (
                        <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <PlayPauseButton audioUrl={response.audioUrl} size="sm" variant="outline" />
                            <div>
                              <p className="font-medium text-gray-900">{response.email}</p>
                              <p className="text-sm text-gray-500">{formatDate(response.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No responses yet for this question</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
