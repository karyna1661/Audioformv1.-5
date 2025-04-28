"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Share2, BarChart } from "lucide-react"
import { ActivateToggle } from "@/components/survey/activate-toggle"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SurveyCardProps {
  id: string
  title: string
  questionCount: number
  responseCount: number
  isActive: boolean
  tier: "free" | "pro" | "enterprise"
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

export function SurveyCard({
  id,
  title,
  questionCount,
  responseCount,
  isActive,
  tier,
  onDelete,
  onToggleActive,
}: SurveyCardProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEdit = () => {
    router.push(`/surveys/${id}/edit`)
  }

  const handleResponses = () => {
    router.push(`/surveys/${id}/responses`)
  }

  const handleAnalyze = () => {
    router.push(`/surveys/${id}/analyze`)
  }

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/respond/${id}`
    navigator.clipboard.writeText(shareUrl)
    // You would typically show a toast notification here
    alert("Survey link copied to clipboard!")
  }

  const handleDeleteConfirm = () => {
    onDelete(id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card
        className="w-full transition-all duration-200 hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{title}</CardTitle>
            <ActivateToggle isActive={isActive} onChange={(newValue) => onToggleActive(id, newValue)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{questionCount} questions</span>
            <span>{responseCount} responses</span>
          </div>
          <div className="mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                tier === "free"
                  ? "bg-slate-100"
                  : tier === "pro"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
              }`}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <Button variant="ghost" size="sm" onClick={handleResponses}>
            View Responses
          </Button>
          <div className={`flex gap-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <Button variant="outline" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            {(tier === "pro" || tier === "enterprise") && (
              <Button variant="outline" size="icon" onClick={handleAnalyze}>
                <BarChart className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the survey "{title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
