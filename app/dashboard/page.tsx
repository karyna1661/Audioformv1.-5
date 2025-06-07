"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SurveyCard } from "@/components/survey/survey-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Mic } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock data for demonstration
const mockSurveys = [
  {
    id: "1",
    title: "Customer Feedback Survey",
    questionCount: 5,
    responseCount: 12,
    isActive: true,
    tier: "free" as const,
  },
  {
    id: "2",
    title: "Product Research Interview",
    questionCount: 8,
    responseCount: 5,
    isActive: true,
    tier: "pro" as const,
  },
  {
    id: "3",
    title: "Conference Attendee Feedback",
    questionCount: 10,
    responseCount: 32,
    isActive: false,
    tier: "enterprise" as const,
  },
]

export default function Dashboard() {
  const router = useRouter()
  const [surveys, setSurveys] = useState(mockSurveys)
  const [activeTab, setActiveTab] = useState("all")

  const filteredSurveys = surveys.filter((survey) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return survey.isActive
    if (activeTab === "inactive") return !survey.isActive
    return true
  })

  const handleCreateSurvey = () => {
    router.push("/surveys/new")
  }

  const handleDeleteSurvey = (id: string) => {
    setSurveys(surveys.filter((survey) => survey.id !== id))
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    setSurveys(surveys.map((survey) => (survey.id === id ? { ...survey, isActive } : survey)))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Surveys</h1>
            <p className="text-muted-foreground">Manage and analyze your voice surveys</p>
          </div>
          <Button onClick={handleCreateSurvey} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Surveys</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredSurveys.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white">
            <Mic className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No surveys found</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === "all"
                ? "You haven't created any surveys yet."
                : activeTab === "active"
                  ? "You don't have any active surveys."
                  : "You don't have any inactive surveys."}
            </p>
            <Button onClick={handleCreateSurvey}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Survey
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                id={survey.id}
                title={survey.title}
                questionCount={survey.questionCount}
                responseCount={survey.responseCount}
                isActive={survey.isActive}
                tier={survey.tier}
                onDelete={handleDeleteSurvey}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        <div className="mt-12 p-6 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-bold mb-2">Explore EchoBoard</h2>
          <p className="mb-4">
            Join our community-driven audio Q&A forum. Ask questions, provide answers, and earn recognition.
          </p>
          <Link href="/echoboard">
            <Button variant="outline">Go to EchoBoard</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">© 2025 Voxera. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
