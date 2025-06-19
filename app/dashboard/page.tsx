"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart3, Users, Mic, Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { RealTimeCounter } from "@/components/survey/real-time-counter"
import { supabase } from "@/lib/supabase/client"
import { ThemedButton } from "@/components/ui/themed-button"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"] & { response_count: number }

export default function Dashboard() {
  const router = useRouter()
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
    activeUsers: 100, // As requested
  })

  useEffect(() => {
    fetchActiveSurvey()
    fetchStats()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActiveSurvey()
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchActiveSurvey = async () => {
    try {
      // Get the most recent active survey
      const { data: surveys, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching active survey:", error)
        return
      }

      if (surveys && surveys.length > 0) {
        const survey = surveys[0]

        // Get response count
        const { count } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("survey_id", survey.id)

        setActiveSurvey({
          ...survey,
          response_count: count || 0,
        })
      } else {
        setActiveSurvey(null)
      }
    } catch (error) {
      console.error("Error fetching active survey:", error)
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
        activeUsers: 100, // As requested
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleDeleteSurvey = async (id: string) => {
    try {
      // Delete responses first
      await supabase.from("responses").delete().eq("survey_id", id)

      // Delete demo session
      await supabase.from("demo_sessions").delete().eq("survey_id", id)

      // Delete survey
      const { error } = await supabase.from("surveys").delete().eq("id", id)

      if (error) {
        console.error("Error deleting survey:", error)
        return
      }

      setActiveSurvey(null)
      fetchStats()
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

      if (activeSurvey) {
        setActiveSurvey({ ...activeSurvey, is_active: isActive })
      }
      fetchStats()
    } catch (error) {
      console.error("Error updating survey:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return "No expiration"

    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your active voice survey</p>
        </div>
        <ThemedButton onClick={() => router.push("/demo/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Survey
        </ThemedButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Survey Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Current Active Survey</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Loading survey data...</p>
          </div>
        ) : !activeSurvey ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active survey</h3>
              <p className="text-gray-600 mb-6">Create your first voice survey to get started</p>
              <ThemedButton onClick={() => router.push("/demo/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Survey
              </ThemedButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Survey Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{activeSurvey.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">{formatDate(activeSurvey.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Expires</p>
                        <p className="text-sm text-muted-foreground">{getTimeRemaining(activeSurvey.expires_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Questions</p>
                    <div className="space-y-2">
                      {Array.isArray(activeSurvey.questions) &&
                        activeSurvey.questions.map((question: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">{question.text}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ThemedButton variant="outline" onClick={() => router.push(`/survey/${activeSurvey.id}/respond`)}>
                      View Response UI
                    </ThemedButton>
                    <ThemedButton variant="outline" onClick={() => router.push(`/surveys/${activeSurvey.id}/analyze`)}>
                      View Analytics
                    </ThemedButton>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Stats */}
            <div>
              <RealTimeCounter surveyId={activeSurvey.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
