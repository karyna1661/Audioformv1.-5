"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Head from "next/head"

const surveySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  questions: z.array(z.string().min(1, "Question cannot be empty")).min(1, "At least one question is required"),
  type: z.enum(["demo", "standard"]).default("demo"),
})

export default function CreateSurveyPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState([""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = value
    setQuestions(updatedQuestions)
  }

  const addQuestion = () => {
    setQuestions([...questions, ""])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index)
      setQuestions(updatedQuestions)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate input
      const validation = surveySchema.safeParse({ title, questions: questions.filter((q) => q.trim()) })
      if (!validation.success) {
        setError(validation.error.errors[0].message)
        return
      }

      // Get user (optional for demo)
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id ?? null

      // Calculate expiry date (24 hours from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // Format questions for database
      const formattedQuestions = questions
        .filter((q) => q.trim())
        .map((question, index) => ({
          id: (index + 1).toString(),
          text: question.trim(),
        }))

      // Create survey
      const { data, error: insertError } = await supabase
        .from("surveys")
        .insert([
          {
            title: title.trim(),
            questions: formattedQuestions,
            type: "demo",
            user_id: userId,
            expires_at: expiresAt.toISOString(),
            is_active: true,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("Database error:", insertError)
        setError("Failed to create survey. Please try again.")
        return
      }

      if (!data) {
        setError("Failed to create survey. No data returned.")
        return
      }

      // Create demo session
      try {
        await supabase.from("demo_sessions").insert([
          {
            survey_id: data.id,
            user_id: userId,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            notified: false,
          },
        ])
      } catch (sessionError) {
        console.error("Error creating demo session:", sessionError)
        // Continue anyway since survey was created
      }

      toast.success("Survey created successfully!")
      router.push(`/survey/${data.id}`)
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create Demo Survey | Audioform</title>
        <meta name="description" content="Create a voice survey demo in seconds" />
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
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl text-center">Survey Details</CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Survey Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base font-medium">
                      Survey Title *
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., What's your favorite productivity tip?"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Questions */}
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Questions *</Label>
                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              type="text"
                              value={question}
                              onChange={(e) => handleQuestionChange(index, e.target.value)}
                              placeholder={`Question ${index + 1}`}
                              className="h-11 sm:h-12 text-sm sm:text-base"
                              required
                            />
                          </div>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuestion(index)}
                              className="h-11 sm:h-12 px-3"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addQuestion}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !title.trim() || questions.every((q) => !q.trim())}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Creating Survey...
                      </>
                    ) : (
                      "Create Voice Survey"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-blue-50/80 backdrop-blur-sm border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Demo Survey Features</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Available for 24 hours</li>
                      <li>• Voice responses from participants</li>
                      <li>• Easy sharing on social media</li>
                      <li>• No account required for respondents</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
