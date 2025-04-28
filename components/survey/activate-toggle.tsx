"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ActivateToggleProps {
  isActive: boolean
  onChange: (isActive: boolean) => void
}

export function ActivateToggle({ isActive, onChange }: ActivateToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="active-mode" checked={isActive} onCheckedChange={onChange} />
      <Label htmlFor="active-mode" className="text-xs">
        {isActive ? "Active" : "Inactive"}
      </Label>
    </div>
  )
}
