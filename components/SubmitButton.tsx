"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps {
  onClick: () => void
  disabled: boolean
  children?: React.ReactNode
}

export function SubmitButton({ onClick, disabled, children }: SubmitButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      size="lg"
    >
      {disabled ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Submitting...
        </>
      ) : (
        children || "Submit Response"
      )}
    </Button>
  )
}
