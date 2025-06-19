"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Plus, Trash2, Play, Users, Clock, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  text: string
}

export default function DemoPage() {
  const router = useRouter()
  const [title, setTitle] = useState("Customer Feedback Survey")
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "How would you rate your overall experience?" },
    { id: "2", text: "What features do you find most valuable?" },
    { id: "3", text: "How can we improve our service?" },
  ])
  const [isCreating, setIsCreating] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id))
    }
  }

  const createSurvey = async () => {
    setIsCreating(true)

    try {
      // Simulate survey creation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a demo survey ID
      const demoId = `demo-${Date.now()}`

      // Redirect to demo dashboard
      router.push(`/demo/${demoId}`)
    } catch (error) {
      console.error("Error creating demo survey:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create Your Demo Survey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of voice-first surveys. Create, customize, and launch your survey in minutes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-indigo-600 mb-2">10,000+</h3>
              <p className="text-gray-600">Active Users</p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">95%</h3>
              <p className="text-gray-600">Response Rate</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-indigo-600 mb-2">2 min</h3>
              <p className="text-gray-600">Setup Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Survey Builder */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Survey Builder</CardTitle>
              <CardDescription className="text-indigo-100">
                Customize your survey title and questions below
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Survey Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
                  Survey Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter your survey title"
                />
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-gray-700">Questions ({questions.length})</Label>
                  <Button
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Textarea
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, e.target.value)}
                              placeholder={`Enter question ${index + 1}...`}
                              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                              rows={2}
                            />
                          </div>
                          {questions.length > 1 && (
                            <Button
                              onClick={() => removeQuestion(question.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  onClick={createSurvey}
                  disabled={isCreating || !title.trim() || questions.some((q) => !q.text.trim())}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Survey...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="w-5 h-5 mr-3" />
                      Create Demo Survey
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Voice Surveys?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Higher Engagement</h3>
              <p className="text-gray-600">
                Voice responses feel more natural and personal, leading to higher completion rates.
              </p>
            </div>

            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rich Insights</h3>
              <p className="text-gray-600">Capture emotion, tone, and nuance that text surveys miss.</p>
            </div>

            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Setup</h3>
              <p className="text-gray-600">Create and launch surveys in minutes, not hours.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
