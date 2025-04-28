"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayPauseButton } from "@/components/audio/play-pause-button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Response {
  id: string
  questionId: string
  audioUrl: string
  email: string
  createdAt: string
  transcript?: string
  sentiment?: "positive" | "neutral" | "negative"
}

interface Question {
  id: string
  text: string
}

interface SurveyData {
  id: string
  title: string
  questions: Question[]
  responses: Response[]
}

export default function AnalyzePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const surveyId = params.id

  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Mock fetch survey data with analysis
  useEffect(() => {
    const fetchSurveyWithAnalysis = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockSurvey: SurveyData = {
          id: surveyId,
          title: "Customer Feedback Survey",
          questions: [
            { id: "1", text: "How would you describe your experience with our product?" },
            { id: "2", text: "What features do you find most valuable?" },
            { id: "3", text: "How can we improve our product to better meet your needs?" },
          ],
          responses: [
            {
              id: "r1",
              questionId: "1",
              audioUrl: "https://example.com/audio1.mp3", // This would be a real URL in production
              email: "user1@example.com",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              transcript:
                "I've had a great experience with your product. It's intuitive and solves my problems efficiently.",
              sentiment: "positive",
            },
            {
              id: "r2",
              questionId: "1",
              audioUrl: "https://example.com/audio2.mp3",
              email: "user2@example.com",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              transcript: "The product is okay, but there are some areas that could be improved.",
              sentiment: "neutral",
            },
            {
              id: "r3",
              questionId: "2",
              audioUrl: "https://example.com/audio3.mp3",
              email: "user1@example.com",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              transcript: "I really like the dashboard and reporting features. They save me a lot of time.",
              sentiment: "positive",
            },
            {
              id: "r4",
              questionId: "3",
              audioUrl: "https://example.com/audio4.mp3",
              email: "user2@example.com",
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              transcript: "The mobile app is frustrating to use and crashes frequently. Please fix these issues.",
              sentiment: "negative",
            },
          ],
        }

        setSurvey(mockSurvey)
      } catch (err) {
        setError("Failed to load survey analysis. Please try again later.")
        console.error("Error fetching survey analysis:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSurveyWithAnalysis()
  }, [surveyId])

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleDownloadCSV = () => {
    if (!survey) return

    // Create CSV content
    let csvContent = "Question,Email,Timestamp,Transcript,Sentiment\n"

    survey.responses.forEach((response) => {
      const question = survey.questions.find((q) => q.id === response.questionId)?.text || ""
      const row = [
        `"${question.replace(/"/g, '""')}"`,
        response.email,
        new Date(response.createdAt).toLocaleString(),
        `"${(response.transcript || "").replace(/"/g, '""')}"`,
        response.sentiment || "",
      ]
      csvContent += row.join(",") + "\n"
    })

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${survey.title.replace(/\s+/g, "_")}_analysis.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEmailReport = () => {
    // In a real app, this would call an API to email the report
    alert("Report will be emailed to you shortly.")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
              <p>{error || "Survey not found"}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter responses based on active tab
  const filteredResponses = survey.responses.filter((response) => {
    if (activeTab === "all") return true
    if (activeTab === "positive") return response.sentiment === "positive"
    if (activeTab === "neutral") return response.sentiment === "neutral"
    if (activeTab === "negative") return response.sentiment === "negative"

    // Filter by question
    return response.questionId === activeTab
  })

  // Calculate sentiment stats
  const sentimentCounts = {
    positive: survey.responses.filter((r) => r.sentiment === "positive").length,
    neutral: survey.responses.filter((r) => r.sentiment === "neutral").length,
    negative: survey.responses.filter((r) => r.sentiment === "negative").length,
  }

  const totalResponses = survey.responses.length
  const sentimentPercentages = {
    positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
    neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100),
    negative: Math.round((sentimentCounts.negative / totalResponses) * 100),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{survey.title}</h1>
          <p className="text-muted-foreground">Analysis and Insights</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleDownloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Button variant="outline" onClick={handleEmailReport}>
            <Mail className="mr-2 h-4 w-4" />
            Email Report
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sentiment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Positive</span>
              <span className="text-sm font-medium">{sentimentPercentages.positive}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${sentimentPercentages.positive}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Neutral</span>
              <span className="text-sm font-medium">{sentimentPercentages.neutral}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${sentimentPercentages.neutral}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Negative</span>
              <span className="text-sm font-medium">{sentimentPercentages.negative}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-red-500 h-2.5 rounded-full"
                style={{ width: `${sentimentPercentages.negative}%` }}
              ></div>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Based on {totalResponses} responses</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChart2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{totalResponses}</div>
                <div className="text-sm text-muted-foreground">Total Responses</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 text-green-600 flex items-center justify-center text-xl font-bold">
                  {sentimentCounts.positive}
                </div>
                <div className="text-2xl font-bold">{sentimentPercentages.positive}%</div>
                <div className="text-sm text-muted-foreground">Positive</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 text-red-600 flex items-center justify-center text-xl font-bold">
                  {sentimentCounts.negative}
                </div>
                <div className="text-2xl font-bold">{sentimentPercentages.negative}%</div>
                <div className="text-sm text-muted-foreground">Negative</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Question Breakdown</h3>
              {survey.questions.map((question, index) => {
                const questionResponses = survey.responses.filter((r) => r.questionId === question.id)
                return (
                  <div key={question.id} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm truncate">
                        Q{index + 1}: {question.text}
                      </span>
                      <span className="text-sm font-medium">{questionResponses.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(questionResponses.length / totalResponses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Responses</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="neutral">Neutral</TabsTrigger>
            <TabsTrigger value="negative">Negative</TabsTrigger>
            {survey.questions.map((question, index) => (
              <TabsTrigger key={question.id} value={question.id}>
                Question {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {filteredResponses.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-slate-50">
            <p className="text-muted-foreground">No responses found for the selected filter.</p>
          </div>
        ) : (
          filteredResponses.map((response) => {
            const question = survey.questions.find((q) => q.id === response.questionId)
            return (
              <Card key={response.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">{response.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        response.sentiment === "positive"
                          ? "bg-green-100 text-green-800"
                          : response.sentiment === "negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      {response.sentiment}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Question:</p>
                    <p>{question?.text}</p>
                  </div>

                  <div className="flex items-center mb-6">
                    <PlayPauseButton audioUrl={response.audioUrl} className="mr-4" />
                    <div className="flex-1">
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                  </div>

                  {response.transcript && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Transcript:</p>
                      <p className="p-3 bg-slate-50 rounded-md">{response.transcript}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
