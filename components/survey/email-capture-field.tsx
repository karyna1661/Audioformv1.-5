"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface EmailCaptureFieldProps {
  onEmailCapture: (email: string) => void
  className?: string
}

export function EmailCaptureField({ onEmailCapture, className }: EmailCaptureFieldProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isTouched, setIsTouched] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleBlur = () => {
    setIsTouched(true)

    if (!email) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setError("")
    onEmailCapture(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)

    if (isTouched) {
      if (!e.target.value) {
        setError("Email is required")
      } else if (!validateEmail(e.target.value)) {
        setError("Please enter a valid email address")
      } else {
        setError("")
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="email">Your Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
