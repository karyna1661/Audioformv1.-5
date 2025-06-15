"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart3, Users, Mic } from "lucide-react"
import { useRouter } from "next/navigation"
import { SurveyCard } from "@/components/survey/survey-card"
import { supabase } from "@/lib/supabase/client"

interface Survey {
  id: string
  title: string
  created_at: string
  questions: any[]
  is_active: boolean
  response_count?: number
}

export default function Dashboard() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
  })

  useEffect(() => {
    fetchSurveys()
    fetchStats()
  }, [])

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("id, title, created_at, questions, is_active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching surveys:", error)
        return
      }

      // Fetch response counts for each survey
      const surveysWithCounts = await Promise.all(
        (data || []).map(async (survey) => {
          const { count } = await supabase
            .from("responses")
            .select("*", { count: "exact", head: true })
            .eq("survey_id", survey.id)

          return {
            ...survey,
            response_count: count || 0,
          }
        }),
      )

      setSurveys(surveysWithCounts)
    } catch (error) {
      console.error("Error fetching surveys:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get survey count
      const { count: surveyCount } = await supabase.from("surveys").select("*", { count: "exact", head: true })

      // Get active survey count
      const { count: activeSurveyCount } = await supabase
        .from("surveys")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      // Get total response count
      const { count: responseCount } = await supabase.from("responses").select("*", { count: "exact", head: true })

      setStats({
        totalSurveys: surveyCount || 0,
        totalResponses: responseCount || 0,
        activeSurveys: activeSurveyCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleDeleteSurvey = async (id: string) => {
    try {
      const { error } = await supabase.from("surveys").delete().eq("id", id)

      if (error) {
        console.error("Error deleting survey:", error)
        return
      }

      setSurveys(surveys.filter((s) => s.id !== id))
      fetchStats() // Refresh stats
    } catch (error) {
      console.error("Error deleting survey:", error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("surveys").update({ is_active: isActive }).eq("id", id)

      if (error) {
        console.error("Error updating survey:", error)
        return
      }

      setSurveys(surveys.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)))
      fetchStats() // Refresh stats
    } catch (error) {
      console.error("Error updating survey:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your voice surveys</p>
        </div>
        <Button onClick={() => router.push("/surveys/new")} className="bg-gradient-to-r from-indigo-500 to-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Create Survey
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSurveys}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSurveys}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResponses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Your Surveys</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
              <p className="text-gray-600 mb-6">Create your first voice survey to get started</p>
              <Button onClick={() => router.push("/surveys/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Survey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                id={survey.id}
                title={survey.title}
                questionCount={Array.isArray(survey.questions) ? survey.questions.length : 0}
                responseCount={survey.response_count || 0}
                isActive={survey.is_active}
                tier="free"
                onDelete={handleDeleteSurvey}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
