"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Share, Copy, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Head from "next/head"

export default function SurveyPage() {
  const { id } = useParams()
  const [survey, setSurvey] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        console.log("Fetching survey with ID:", id)

        const { data, error } = await supabase.from("demos").select("*").eq("id", id).single()

        if (error) {
          console.error("Error fetching survey:", error)
          setError("Survey not found")
          return
        }

        if (data) {
          console.log("Survey fetched:", data)
          setSurvey(data)
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load survey")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSurvey()
    }
  }, [id])

  const copyLink = async () => {
    const link = `${window.location.origin}/respond/${id}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Link copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const shareToFarcaster = () => {
    const text = `@audioform ${encodeURIComponent(survey.topic)}`
    const url = `${window.location.origin}/respond/${id}`
    const shareLink = `https://warpcast.com/~/compose?text=${text}%20${encodeURIComponent(url)}`
    window.open(shareLink, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Survey not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{survey.topic} | Voice Survey</title>
        <meta name="description" content={`Voice your thoughts: ${survey.topic}`} />
        <meta property="og:title" content={survey.topic} />
        <meta property="og:description" content="Voice your thoughts in seconds" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/respond/${id}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card className="bg-white rounded-xl shadow-lg border-0">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{survey.topic}</h1>
                <p className="text-gray-600 mb-6">
                  Share this survey on Farcaster to get voice replies in-app, or copy the link to share anywhere.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={shareToFarcaster}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Share to Farcaster
                </Button>

                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Survey Link
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 text-center mb-3">Direct response link:</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <code className="flex-1 text-sm text-gray-700 truncate">
                      {`${window.location.origin}/respond/${id}`}
                    </code>
                    <Button size="sm" variant="ghost" onClick={() => window.open(`/respond/${id}`, "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Survey expires: {new Date(survey.expires_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
