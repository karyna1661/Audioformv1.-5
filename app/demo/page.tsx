"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Mic, Share, Sparkles, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Head from "next/head"

export default function DemoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prompt: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.prompt.trim()) {
      toast.error("Please fill in the required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/demo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create survey")
      }

      const data = await response.json()

      if (data.success && data.survey) {
        toast.success("Survey created successfully!")
        router.push(`/demo/${data.survey.id}`)
      } else {
        throw new Error(data.error || "Failed to create survey")
      }
    } catch (error) {
      console.error("Error creating survey:", error)
      toast.error("Failed to create survey. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Head>
        <title>Create Voice Survey | Audioform Demo</title>
        <meta
          name="description"
          content="Create engaging voice surveys in seconds. Collect authentic audio responses from your audience."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Mobile-optimized container */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
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
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl text-center flex items-center justify-center gap-2">
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  Survey Details
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Survey Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base font-medium">
                      Survey Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., What's your favorite productivity tip?"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base font-medium">
                      Description (Optional)
                    </Label>
                    <Input
                      id="description"
                      placeholder="Brief context about your survey"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* Voice Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-sm sm:text-base font-medium">
                      Voice Prompt *
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="What question do you want people to answer with their voice?"
                      value={formData.prompt}
                      onChange={(e) => handleInputChange("prompt", e.target.value)}
                      className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none"
                      required
                    />
                    <p className="text-xs sm:text-sm text-gray-500">
                      This is what respondents will see when recording their answer
                    </p>
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base font-medium">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Get notified when responses come in"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !formData.title.trim() || !formData.prompt.trim()}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Creating Survey...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Create Voice Survey
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Features Grid - Mobile Optimized */}
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Voice Responses</h3>
                <p className="text-xs sm:text-sm text-gray-600">Capture authentic audio feedback in seconds</p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Share className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Easy Sharing</h3>
                <p className="text-xs sm:text-sm text-gray-600">Share via link or social media platforms</p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl sm:col-span-1 col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">24hr Demo</h3>
                <p className="text-xs sm:text-sm text-gray-600">Full access for 24 hours, no signup required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
