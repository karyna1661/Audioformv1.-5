"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemedButton } from "@/components/ui/themed-button"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "@/components/survey/share-button"
import { RealTimeCounter } from "@/components/survey/real-time-counter"
import { Calendar, Clock, CheckCircle, ArrowLeft, Plus } from "lucide-react"
import { theme } from "@/lib/theme/colors"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"] & {
  responses: Database["public"]["Tables"]["responses"]["Row"][]
}

const supabase = createClientComponentClient<Database>()

export default function SurveyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialResponseCount, setInitialResponseCount] = useState(0)

  useEffect(() => {
    async function loadSurvey() {
      if (!id) {
        setError("No survey ID provided")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("surveys")
          .select(`
            *,
            responses(*)
          `)
          .eq("id", id)
          .single()

        if (error) {
          console.error("Survey query error:", error)
          setError("Survey not found")
          return
        }

        if (!data) {
          setError("Survey not found")
          return
        }

        setSurvey(data as Survey)
        setInitialResponseCount(data.responses?.length || 0)
      } catch (err) {
        console.error("Error loading survey:", err)
        setError("Failed to load survey")
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading survey...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Survey Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">{error || "The requested survey could not be found."}</p>
            <ThemedButton onClick={() => router.push("/")} className="w-full">
              Return Home
            </ThemedButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = survey.expires_at && new Date(survey.expires_at) < new Date()
  const isActive = survey.is_active && !isExpired

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        {/* Navigation */}
        <div className="mb-6">
          <ThemedButton variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </ThemedButton>
        </div>

        {/* Survey Header */}
        <Card className="mb-6 border-indigo-100 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl text-gray-900 mb-3">{survey.title}</CardTitle>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(survey.created_at).toLocaleDateString()}</span>
                  </div>
                  {survey.expires_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Expires {new Date(survey.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={isActive ? theme.primary.gradient + " text-white" : ""}
                >
                  {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Survey Status */}
            <Card className="border-indigo-100 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div
                    className={`w-20 h-20 ${theme.primary.gradient} rounded-full flex items-center justify-center mx-auto shadow-lg`}
                  >
                    <CheckCircle className="w-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Survey Created Successfully!</h3>
                    <p className="text-gray-600 text-lg">
                      Your survey is ready to collect responses. Share it with your audience to start gathering
                      insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Options */}
            <Card className="border-indigo-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className={`w-6 h-6 ${theme.primary.gradient} rounded flex items-center justify-center`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Share Your Survey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Get your survey in front of the right audience. Choose from multiple sharing options below.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <ShareButton surveyId={survey.id} surveyTitle={survey.title} className="flex-1" />
                  <ThemedButton variant="outline" className="flex-1 sm:flex-none">
                    View Analytics
                  </ThemedButton>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Counter */}
            <RealTimeCounter surveyId={survey.id} initialCount={initialResponseCount} />

            {/* Quick Actions */}
            <Card className="border-indigo-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ThemedButton variant="outline" onClick={() => router.push("/demo")} className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Survey
                </ThemedButton>
                <ThemedButton
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full justify-start"
                >
                  View All Surveys
                </ThemedButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
