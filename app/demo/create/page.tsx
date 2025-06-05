"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function CreateDemoPage() {
  const [topic, setTopic] = useState("")
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const handleCreateSurvey = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic for your survey")
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/demo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create survey")
      }

      if (data.success && data.demoId) {
        toast.success("Survey created successfully!")
        router.push(`/survey/${data.demoId}`)
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err: any) {
      console.error("Survey creation failed:", err)
      toast.error(err.message || "Failed to create survey. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/demo">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Demos
              </Button>
            </Link>
          </div>

          {/* Main Form */}
          <Card className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm border-0">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Voice Survey</h1>
                <p className="text-sm sm:text-base text-gray-600">Ask anything and get authentic voice responses</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    Survey Question
                  </label>
                  <Input
                    id="topic"
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
                </div>

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
              </div>

              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> Your survey will be available for 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
