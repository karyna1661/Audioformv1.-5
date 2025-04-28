"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface ChannelSelectorProps {
  channels: string[]
  activeChannel: string
  onSelectChannel: (channel: string) => void
}

export function ChannelSelector({ channels, activeChannel, onSelectChannel }: ChannelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto justify-between">
          #{activeChannel}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {channels.map((channel) => (
          <DropdownMenuItem
            key={channel}
            onClick={() => onSelectChannel(channel)}
            className={activeChannel === channel ? "bg-slate-100 font-medium" : ""}
          >
            #{channel}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
