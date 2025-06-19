"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/lib/theme/colors"
import { forwardRef } from "react"

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ variant = "primary", size = "md", children, className, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          buttonVariants[variant],
          sizeClasses[size],
          "font-medium rounded-lg",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    )
  },
)

ThemedButton.displayName = "ThemedButton"
