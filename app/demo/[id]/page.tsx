"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { DemoDashboard } from "@/components/survey/demo-flow/demo-dashboard"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
const getMockSurveyData = (id: string) => {
  const createdAt = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString() // 23 hours from now

  return {
    id,
    title: "Customer Feedback Demo",
    questions: [
      { id: "q1", text: "How would you describe your experience with our product?" },
      { id: "q2", text: "What features do you find most valuable?" },
      { id: "q3", text: "How can we improve our product to better meet your needs?" },
    ],
    responses: [
      {
        id: "r1",
        questionId: "q1",
        audioUrl: "https://example.com/audio1.mp3", // This would be a real URL in production
        email: "user1@example.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: "r2",
        questionId: "q2",
        audioUrl: "https://example.com/audio2.mp3",
        email: "user2@example.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      },
    ],
    createdAt,
    expiresAt,
  }
}

export default function DemoDashboardPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [surveyData, setSurveyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, this would fetch the survey data from an API
    const fetchSurveyData = async () => {
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get mock data
        const data = getMockSurveyData(params.id)
        setSurveyData(data)
      } catch (err) {
        console.error("Error fetching survey data:", err)
        setError("Failed to load survey data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load survey data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSurveyData()
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !surveyData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p>{error || "Survey not found"}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <DemoDashboard
          surveyId={surveyData.id}
          title={surveyData.title}
          questions={surveyData.questions}
          responses={surveyData.responses}
          createdAt={surveyData.createdAt}
          expiresAt={surveyData.expiresAt}
        />
      </main>
    </div>
  )
}
