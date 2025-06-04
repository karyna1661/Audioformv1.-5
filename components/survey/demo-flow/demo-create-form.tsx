"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define the question type
interface Question {
  id: string
  text: string
}

export function DemoCreateForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "" }])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For demo, limit to 5 questions
  const maxQuestions = 5

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

  const handlePublishDemo = async () => {
    setError(null)
    setIsSaving(true)

    try {
      // Validate form client-side
      if (!title.trim()) {
        throw new Error("Please enter a survey title")
      }

      const validQuestions = questions.filter((q) => q.text.trim())
      if (validQuestions.length === 0) {
        throw new Error("Please add at least one question")
      }

      // Prepare the payload - send questions as simple strings
      const payload = {
        title: title.trim(),
        questions: validQuestions.map((q) => q.text.trim()),
        email: email.trim() || undefined,
      }

      console.log("Sending payload:", payload)

      const response = await fetch("/api/demo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("API response:", { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!data.demoId) {
        throw new Error("No survey ID returned from server")
      }

      // Success!
      toast.success("Survey created successfully!")
      router.push(`/demo?demoId=${data.demoId}`)
    } catch (error) {
      console.error("Error creating demo survey:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create survey"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Create Demo Survey</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              24-hour demo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              placeholder="Enter survey title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email to save your demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Providing your email allows us to notify you before your demo expires.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`question-${question.id}`} className="text-sm font-medium">
                    Question {index + 1}
                  </Label>
                  <Button
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
                  id={`question-${question.id}`}
                  placeholder="Enter your question"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                  className="text-base min-h-[80px]"
                />
              </div>
            ))}

            <Button
              variant="outline"
              onClick={handleAddQuestion}
              disabled={questions.length >= maxQuestions}
              className="w-full h-12"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question ({questions.length}/{maxQuestions})
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handlePublishDemo} disabled={isSaving} className="h-12 px-6">
            {isSaving ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Publish Demo Survey
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground px-4">
        <p>
          Your demo survey will be available for 24 hours. No account required.
          <br />
          After 24 hours, you'll need to join our waitlist to access your responses.
        </p>
      </div>
    </div>
  )
}
