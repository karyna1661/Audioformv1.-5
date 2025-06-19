import { supabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { ShareButton } from "@/components/survey/share-button"
import { createResponseUrl } from "@/lib/utils/url"

interface SurveyData {
  id: string
  title: string
  description: string | null
  created_at: string
  questions: any[]
  is_active: boolean
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
  const surveyId = params.id.trim()

  try {
    const { data, error } = await supabaseServer
      .from("surveys")
      .select("id, title, description, created_at, questions, is_active")
      .eq("id", surveyId)
      .single()

    if (error || !data) {
      console.error("Supabase fetch error:", error)
      return notFound()
    }

    const survey: SurveyData = data
    // Use the centralized URL utility
    const responseUrl = createResponseUrl(survey.id)

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card className="bg-white rounded-xl shadow-lg border-0">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
                {survey.description && <p className="text-gray-600 mb-6">{survey.description}</p>}
                <p className="text-gray-500 text-sm">
                  {Array.isArray(survey.questions) ? survey.questions.length : 1} question
                  {Array.isArray(survey.questions) && survey.questions.length !== 1 ? "s" : ""}
                </p>
              </div>

              {!survey.is_active ? (
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-red-600 font-medium">This survey is not active</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ShareButton surveyId={survey.id} surveyTitle={survey.title} className="w-full" />

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 text-center mb-3">Direct response link:</p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        readOnly
                        value={responseUrl}
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                      <a href={responseUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">Created: {new Date(survey.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (err) {
    console.error("Unexpected server error:", err)
    return notFound()
  }
}
