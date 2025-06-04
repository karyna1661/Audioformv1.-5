"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Mic, ArrowRight, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Head from "next/head"

interface Question {
  id: string
  text: string
}

export default function DemoCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "" }])

  const handleAddQuestion = () => {
    if (questions.length >= 5) return
    const newId = (questions.length + 1).toString()
    setQuestions([...questions, { id: newId, text: "" }])
  }

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please enter a survey title")
      return
    }

    const validQuestions = questions.filter((q) => q.text.trim())
    if (validQuestions.length === 0) {
      toast.error("Please add at least one question")
      return
    }

    setLoading(true)

    try {
      console.log("Creating survey with:", {
        title: title.trim(),
        questions: validQuestions.map((q) => q.text.trim()),
        email: email.trim() || undefined,
      })

      const response = await fetch("/api/demo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          questions: validQuestions.map((q) => q.text.trim()),
          email: email.trim() || undefined,
        }),
      })

      const data = await response.json()
      console.log("API Response:", { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!data.demoId) {
        throw new Error("No survey ID returned from server")
      }

      toast.success("Survey created successfully!")
      router.push(`/demo?demoId=${data.demoId}`)
    } catch (error) {
      console.error("Error creating survey:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create survey"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create Demo Survey | Audioform</title>
        <meta name="description" content="Create a 24-hour demo voice survey" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Create Demo Survey</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build a voice survey that expires in 24 hours. Perfect for testing Audioform.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                  <Mic className="h-6 w-6 text-blue-600" />
                  Survey Details
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Survey Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">
                      Survey Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., What's your favorite productivity tip?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Get notified when responses come in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Questions *</Label>
                    {questions.map((question, index) => (
                      <div key={question.id} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Question {index + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveQuestion(question.id)}
                            disabled={questions.length <= 1}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Enter your question"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                          className="text-base min-h-[80px]"
                        />
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddQuestion}
                      disabled={questions.length >= 5}
                      className="w-full h-12"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question ({questions.length}/5)
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Survey...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-5 w-5" />
                        Create Demo Survey
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
