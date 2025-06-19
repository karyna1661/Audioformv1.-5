"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "@/components/survey/share-button"
import { Calendar, Users, Clock, CheckCircle } from "lucide-react"
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
  const [responseCount, setResponseCount] = useState(0)

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
        setResponseCount(data.responses?.length || 0)
      } catch (err) {
        console.error("Error loading survey:", err)
        setError("Failed to load survey")
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [id])

  // Real-time response counter
  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`survey-${id}-responses`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `survey_id=eq.${id}`,
        },
        () => {
          setResponseCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading survey...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Survey Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error || "The requested survey could not be found."}</p>
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = survey.expires_at && new Date(survey.expires_at) < new Date()
  const isActive = survey.is_active && !isExpired

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Survey Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-900 mb-2">{survey.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(survey.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{responseCount} responses</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                </Badge>
                {survey.expires_at && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Expires {new Date(survey.expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Survey Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey Created Successfully</h3>
                <p className="text-gray-600">
                  Your survey is ready! Share it with others to start collecting responses.
                </p>
              </div>

              {/* Real-time Response Count */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-gray-900">
                    {responseCount} Response{responseCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Updates in real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Share Your Survey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">Share your survey to collect more responses from your audience.</p>

            <ShareButton surveyId={survey.id} surveyTitle={survey.title} className="w-full" />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="flex-1 border-indigo-200 hover:bg-indigo-50 text-indigo-600"
          >
            View Dashboard
          </Button>
          <Button
            onClick={() => router.push("/demo")}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Create New Survey
          </Button>
        </div>
      </div>
    </div>
  )
}
