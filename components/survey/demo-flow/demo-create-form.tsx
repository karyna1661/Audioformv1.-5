"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAnalytics } from "@/contexts/analytics-context"

// Define the question type
interface Question {
  id: string
  text: string
}

export function DemoCreateForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { trackEvent } = useAnalytics()
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "" }])
  const [isSaving, setIsSaving] = useState(false)

  // For demo, limit to 5 questions
  const maxQuestions = 5

  // Track form view
  useEffect(() => {
    trackEvent("demo_form_viewed")
  }, [trackEvent])

  const handleAddQuestion = () => {
    if (questions.length >= maxQuestions) return

    const newId = (questions.length + 1).toString()
    setQuestions([...questions, { id: newId, text: "" }])

    // Track question added
    trackEvent("demo_question_added", { question_count: questions.length + 1 })
  }

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((q) => q.id !== id))

    // Track question removed
    trackEvent("demo_question_removed", { question_count: questions.length - 1 })
  }

  const handleQuestionChange = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  const handlePublishDemo = async () => {
    setIsSaving(true)

    // Validate form
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a survey title",
        variant: "destructive",
      })
      setIsSaving(false)
      return
    }

    if (questions.some((q) => !q.text.trim())) {
      toast({
        title: "Empty questions",
        description: "Please fill in all questions",
        variant: "destructive",
      })
      setIsSaving(false)
      return
    }

    try {
      // Track demo submission attempt
      await trackEvent("demo_submission_started", {
        title,
        question_count: questions.length,
        has_email: !!email,
      })

      // Get session ID from localStorage for tracking
      const sessionId = localStorage.getItem("audioform_session_id")

      // Call our API to create the demo survey
      const response = await fetch("/api/demo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions: questions.map((q) => ({ id: q.id, text: q.text })),
          email: email || undefined, // Only send if provided
          sessionId, // Pass session ID for analytics tracking
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create demo survey")
      }

      // Track successful demo creation
      await trackEvent("demo_submission_completed", {
        title,
        question_count: questions.length,
        has_email: !!email,
        demo_id: data.demoId,
      })

      // Redirect to demo dashboard with the demoId
      router.push(`/demo?demoId=${data.demoId}`)
    } catch (error) {
      console.error("Error creating demo survey:", error)

      // Track error
      await trackEvent("demo_submission_error", {
        title,
        question_count: questions.length,
        has_email: !!email,
        error: (error as Error).message,
      })

      toast({
        title: "Error",
        description: "Failed to create demo survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Demo Survey</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              24-hour demo
            </Badge>
          </div>
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

            <div className="space-y-2">
              <Label htmlFor="email">Your Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email to save your demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Providing your email allows us to notify you before your demo expires.
              </p>
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
              Add Question ({questions.length}/{maxQuestions})
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handlePublishDemo} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Publish Demo Survey
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Your demo survey will be available for 24 hours. No account required.
          <br />
          After 24 hours, you'll need to join our waitlist to access your responses.
        </p>
      </div>
    </div>
  )
}
