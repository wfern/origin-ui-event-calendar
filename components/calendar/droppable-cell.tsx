"use client"

import { useDroppable } from "@dnd-kit/core"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useCalendarDnd } from "@/hooks/use-calendar-dnd"

interface DroppableCellProps {
  id: string
  date: Date
  time?: number // For week/day views, represents hours (e.g., 9.25 for 9:15)
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function DroppableCell({ id, date, time, children, className, onClick }: DroppableCellProps) {
  const { activeEvent, activeView } = useCalendarDnd()

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      date,
      time,
    },
  })

  // Format time for display in tooltip (only for debugging)
  const formattedTime =
    time !== undefined
      ? `${Math.floor(time)}:${Math.round((time - Math.floor(time)) * 60)
          .toString()
          .padStart(2, "0")}`
      : null

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        className,
        isOver &&
          activeEvent &&
          (activeView === "month"
            ? "bg-primary/10 dark:bg-primary/20"
            : "bg-primary/5 dark:bg-primary/10 border-primary/20"),
      )}
      title={formattedTime ? `${formattedTime}` : undefined}
    >
      {children}
    </div>
  )
}

