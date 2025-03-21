"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useRef, useEffect, useState } from "react"
import { differenceInDays } from "date-fns"
import type { CalendarEvent } from "@/components/calendar/types"
import { EventItem } from "@/components/calendar/event-item"
import { useCalendarDnd } from "@/hooks/use-calendar-dnd"

interface DraggableEventProps {
  event: CalendarEvent
  view: "month" | "week" | "day"
  showTime?: boolean
  onClick?: (e: React.MouseEvent) => void
  height?: number
  isMultiDay?: boolean
  multiDayWidth?: number
  isFirstDay?: boolean
  isLastDay?: boolean
}

export function DraggableEvent({
  event,
  view,
  showTime,
  onClick,
  height,
  isMultiDay,
  multiDayWidth,
  isFirstDay = true,
  isLastDay = true,
}: DraggableEventProps) {
  const { activeId } = useCalendarDnd()
  const elementRef = useRef<HTMLDivElement>(null)
  const [dragHandlePosition, setDragHandlePosition] = useState<{ x: number; y: number } | null>(null)

  // Check if this is a multi-day event
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  const isMultiDayEvent = isMultiDay || event.allDay || differenceInDays(eventEnd, eventStart) >= 1

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${event.id}-${view}`,
    data: {
      event,
      view,
      height: height || elementRef.current?.offsetHeight || null,
      isMultiDay: isMultiDayEvent,
      multiDayWidth: multiDayWidth,
      dragHandlePosition,
      isFirstDay,
      isLastDay,
    },
  })

  // Update height in data when it changes
  useEffect(() => {
    if (elementRef.current) {
      const currentHeight = elementRef.current.offsetHeight
      if (currentHeight > 0 && attributes.data) {
        attributes.data.height = currentHeight
      }
    }
  }, [attributes, event])

  // Handle mouse down to track where on the event the user clicked
  const handleMouseDown = (e: React.MouseEvent) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      setDragHandlePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  // Don't render if this event is being dragged
  if (isDragging || activeId === `${event.id}-${view}`) {
    return <div ref={setNodeRef} className="opacity-0" style={{ height: height || "auto" }} />
  }

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        height: height || "auto",
        width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      }
    : {
        height: height || "auto",
        width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (elementRef) elementRef.current = node
      }}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        if (elementRef.current) {
          const rect = elementRef.current.getBoundingClientRect()
          const touch = e.touches[0]
          setDragHandlePosition({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          })
        }
      }}
      className="touch-none"
    >
      <EventItem event={event} view={view} showTime={showTime} isFirstDay={isFirstDay} isLastDay={isLastDay} />
    </div>
  )
}

