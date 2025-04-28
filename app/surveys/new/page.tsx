"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

// Define the question type
interface Question {
  id: string
  text: string
}

export default function NewSurvey() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "" }])
  const [isSaving, setIsSaving] = useState(false)

  // For free tier, limit to 5 questions
  const userTier = "free" // This would come from user context in a real app
  const maxQuestions = userTier === "free" ? 5 : 100

  const handleAddQuestion = () => {
    if (questions.length >= maxQuestions) return

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

  const handleSave = async () => {
    setIsSaving(true)

    // Validate form
    if (!title.trim()) {
      alert("Please enter a survey title")
      setIsSaving(false)
      return
    }

    if (questions.some((q) => !q.text.trim())) {
      alert("Please fill in all questions")
      setIsSaving(false)
      return
    }

    // In a real app, this would be an API call
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to dashboard on success
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving survey:", error)
      alert("Failed to save survey. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleCancel} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Survey</h1>
          <p className="text-muted-foreground">Design your voice-first survey</p>
        </div>
        <Badge variant="outline">{userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier</Badge>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  placeholder="Enter survey title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`question-${question.id}`}>Question {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(question.id)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    id={`question-${question.id}`}
                    placeholder="Enter your question"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                  />
                </div>
              ))}

              <Button
                variant="outline"
                onClick={handleAddQuestion}
                disabled={questions.length >= maxQuestions}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question {userTier === "free" && `(${questions.length}/${maxQuestions})`}
              </Button>

              {userTier === "free" && questions.length >= maxQuestions && (
                <p className="text-sm text-muted-foreground text-center">
                  You've reached the maximum number of questions for the Free tier.
                  <br />
                  <a href="/pricing" className="text-blue-600 hover:underline">
                    Upgrade to Pro for unlimited questions
                  </a>
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Survey
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
