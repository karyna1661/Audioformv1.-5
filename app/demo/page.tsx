"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { createSurvey } from "@/lib/actions/createSurvey"
import { toast } from "sonner"
import Head from "next/head"

export default function DemoPage() {
  const [topic, setTopic] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error("Auth error:", error)
          // For demo purposes, we'll allow anonymous users
          setUser(null)
        } else {
          setUser(data.user)
        }
      } catch (err) {
        console.error("Error fetching user:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleCreateSurvey = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for your survey")
      return
    }

    setCreating(true)
    setError(null)

    try {
      console.log("Creating survey with topic:", topic)
      const { demoId } = await createSurvey(topic)
      console.log("Survey created with ID:", demoId)

      toast.success("Survey created successfully!")
      router.push(`/survey/${demoId}`)
    } catch (err: any) {
      console.error("Survey creation failed:", err)
      const errorMessage = err.message || "Failed to create survey. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Create Voice Survey | Audioform Demo</title>
        <meta name="description" content="Create engaging voice surveys in seconds" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border mb-4 sm:mb-6">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">24-Hour Demo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Create Your Voice Survey
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              Build engaging audio surveys that capture authentic responses. Perfect for feedback, research, and
              community engagement.
            </p>
          </div>

          {/* Main Form */}
          <div className="max-w-xl mx-auto">
            <Card className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">What's Your Question?</h2>
                  <p className="text-sm sm:text-base text-gray-600">Ask anything and get authentic voice responses</p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="e.g., What's your favorite productivity tip?"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-12 sm:h-14 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !creating && topic.trim()) {
                        handleCreateSurvey()
                      }
                    }}
                  />

                  <Button
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2"
                    onClick={handleCreateSurvey}
                    disabled={creating || !topic.trim()}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                        Creating Survey...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        Create Voice Survey
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                {!user && (
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Demo Mode:</strong> Your survey will be available for 24 hours.
                      <br />
                      <a href="/login" className="underline hover:no-underline">
                        Sign up
                      </a>{" "}
                      for permanent surveys.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Easy Sharing</h3>
                <p className="text-xs text-gray-600">Share on Farcaster and social media</p>
              </div>

              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">Voice Responses</h3>
                <p className="text-xs text-gray-600">Authentic audio feedback in seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
