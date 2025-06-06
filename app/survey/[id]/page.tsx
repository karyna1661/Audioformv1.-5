import { supabaseServer } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share, ExternalLink } from "lucide-react"
import { ShareButton } from "@/components/survey/share-button"
import { getSurveyResponseUrl, getFarcasterShareUrl } from "@/utils/url-utils"

interface SurveyData {
  id: string
  title: string
  created_at: string
  expires_at: string
  questions: any[]
  type: string
}

export default async function SurveyPage({ params }: { params: { id: string } }) {
  const surveyId = params.id.trim() // Clean the survey ID
  let survey: SurveyData | null = null

  try {
    console.log("Fetching survey with ID:", surveyId)

    const { data, error } = await supabaseServer
      .from("surveys")
      .select("id, title, created_at, expires_at, questions, type")
      .eq("id", surveyId)
      .single()

    if (error) {
      console.error("Supabase fetch error:", error)
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Survey not found</h2>
            <p className="text-gray-600">The survey you're looking for doesn't exist or has been removed.</p>
            <a href="/demo" className="text-blue-600 hover:underline mt-4 inline-block">
              Create a new survey
            </a>
          </div>
        </div>
      )
    }

    if (!data) {
      console.error("No data returned for survey ID:", surveyId)
      return notFound()
    }

    survey = data
    console.log("Survey data:", survey)
  } catch (err) {
    console.error("Unexpected server error:", err)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading survey</h2>
          <p className="text-gray-600">Please try again later.</p>
          <a href="/demo" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to surveys
          </a>
        </div>
      </div>
    )
  }

  // Check if survey has expired
  const isExpired = survey.expires_at && new Date(survey.expires_at) < new Date()
  const hoursLeft = survey.expires_at
    ? Math.max(0, Math.floor((new Date(survey.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0

  // Use utility functions for URL construction
  const responseUrl = getSurveyResponseUrl(survey.id)
  const shareText = `@audioform "${survey.title}" (Reply in voice 👇)`
  const farcasterUrl = getFarcasterShareUrl(shareText, responseUrl)

  console.log("Generated response URL:", responseUrl) // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="bg-white rounded-xl shadow-lg border-0">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
              <p className="text-gray-600 mb-6">
                Share this survey on Farcaster to get voice replies in-app, or copy the link to share anywhere.
              </p>
            </div>

            {isExpired ? (
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-red-600 font-medium">This survey has expired</p>
                <p className="text-gray-600 text-sm mt-2">Demo surveys are only available for 24 hours</p>
                <a href="/demo" className="text-blue-600 hover:underline mt-4 inline-block">
                  Create a new survey
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <a href={farcasterUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                    <Share className="w-4 h-4" />
                    Share on Farcaster
                  </Button>
                </a>

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
              {!isExpired && survey.expires_at && (
                <p className="text-sm text-amber-600 font-medium mb-1">
                  Demo expires in {hoursLeft} {hoursLeft === 1 ? "hour" : "hours"}
                </p>
              )}
              <p className="text-xs text-gray-500">Created: {new Date(survey.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
