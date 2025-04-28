"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EchoButtonProps {
  count: number
  onClick: () => Promise<void> | void
}

export function EchoButton({ count, onClick }: EchoButtonProps) {
  const [isEchoing, setIsEchoing] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)

  const handleClick = async () => {
    setIsEchoing(true)

    try {
      await onClick()
    } finally {
      setIsEchoing(false)
    }
  }

  const handleMouseEnter = () => {
    setIsPulsing(true)
  }

  const handleMouseLeave = () => {
    setIsPulsing(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "text-green-600 hover:text-green-700 hover:bg-green-50 transition-all",
        isPulsing && "animate-pulse",
      )}
      onClick={handleClick}
      disabled={isEchoing}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="mr-1 text-lg">🔊</span>
      <span className="font-medium">{count}</span>
    </Button>
  )
}
