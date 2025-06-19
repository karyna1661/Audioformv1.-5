"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

interface Question {
  id: string
  text: string
}

export default function NewSurvey() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: "1", text: "" }])
  const [isSaving, setIsSaving] = useState(false)

  const handleAddQuestion = () => {
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
      toast.error("Please enter a survey title")
      setIsSaving(false)
      return
    }

    if (questions.some((q) => !q.text.trim())) {
      toast.error("Please fill in all questions")
      setIsSaving(false)
      return
    }

    try {
      // Prepare questions data
      const questionsData = questions.map((q, index) => ({
        id: q.id,
        text: q.text.trim(),
        order: index + 1,
      }))

      // Create survey in database
      const { data: survey, error } = await supabase
        .from("surveys")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          questions: questionsData,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating survey:", error)
        toast.error("Failed to create survey. Please try again.")
        return
      }

      toast.success("Survey created successfully!")
      router.push(`/surveys/${survey.id}`)
    } catch (error) {
      console.error("Error creating survey:", error)
      toast.error("Failed to create survey. Please try again.")
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
      </div>

      <div className="grid gap-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter survey title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this survey is about"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
                    <Label htmlFor={`question-${question.id}`}>Question {index + 1} *</Label>
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
                    rows={2}
                  />
                </div>
              ))}

              <Button variant="outline" onClick={handleAddQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
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
                  Create Survey
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
