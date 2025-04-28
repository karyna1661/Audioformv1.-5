"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface SwipeNavigatorProps {
  children: React.ReactNode[]
  currentIndex: number
  onIndexChange: (index: number) => void
  className?: string
}

export function SwipeNavigator({ children, currentIndex, onIndexChange, className }: SwipeNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const isMobile = useMobile()

  // Minimum swipe distance in pixels
  const minSwipeDistance = 50

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`
    }
  }, [currentIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < children.length - 1) {
      onIndexChange(currentIndex + 1)
    } else if (isRightSwipe && currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < children.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-in-out w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="flex-shrink-0 w-full">
            {child}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {children.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-blue-500" : "bg-gray-300"}`}
            onClick={() => onIndexChange(index)}
          />
        ))}
      </div>

      {!isMobile && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
              currentIndex === children.length - 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={goToNext}
            disabled={currentIndex === children.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
