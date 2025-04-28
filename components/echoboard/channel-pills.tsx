"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ChannelPillsProps {
  channels: string[]
  activeChannel: string
  onSelectChannel: (channel: string) => void
}

export function ChannelPills({ channels, activeChannel, onSelectChannel }: ChannelPillsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 p-1">
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => onSelectChannel(channel)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeChannel === channel
                ? "bg-blue-100 text-blue-800"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200",
            )}
          >
            #{channel}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  )
}
