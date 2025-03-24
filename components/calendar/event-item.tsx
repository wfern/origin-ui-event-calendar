"use client"

import type React from "react"

import { format, differenceInMinutes, getMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { Clock, MapPin } from "lucide-react"
import { useMemo } from "react"
import { getEventColorClasses, getBorderRadiusClasses } from "@/components/calendar/utils"

// Using date-fns format with custom formatting:
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date) => {
  return format(date, getMinutes(date) === 0 ? 'ha' : 'h:mma').toLowerCase();
};

interface EventItemProps {
  event: CalendarEvent
  view: "month" | "week" | "day" | "agenda"
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  currentTime?: Date // For updating time during drag
  isFirstDay?: boolean
  isLastDay?: boolean
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
}: EventItemProps) {
  const eventColor = event.color

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = currentTime || new Date(event.start)
  const displayEnd = currentTime
    ? new Date(new Date(currentTime).getTime() + (new Date(event.end).getTime() - new Date(event.start).getTime()))
    : new Date(event.end)

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart)
  }, [displayStart, displayEnd])

  const getEventTime = () => {
    if (event.allDay) return "All day"

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart)
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(displayStart)} - ${formatTimeWithOptionalMinutes(displayEnd)}`
  }

  if (view === "month") {
    return (
      <div
        className={cn(
          "h-full flex items-center px-1 sm:px-2 text-[10px] sm:text-xs font-medium cursor-pointer select-none backdrop-blur-md transition",
          getEventColorClasses(eventColor),
          getBorderRadiusClasses(isFirstDay, isLastDay),
          isDragging && "shadow-lg",
        )}
        onClick={onClick}
      >
        <span className="truncate">
          {!event.allDay && <span className="text-[11px] opacity-70 truncate">{formatTimeWithOptionalMinutes(displayStart)} </span>}
          {event.title}
        </span>
      </div>
    )
  }

  if (view === "week" || view === "day") {
    // For short events (less than 45 minutes), display title and time on the same line
    if (durationMinutes < 45) {
      return (
        <div
          className={cn(
            "px-2 py-1 text-xs font-medium cursor-pointer select-none h-full flex items-center overflow-hidden backdrop-blur-md transition",
            getEventColorClasses(eventColor),
            getBorderRadiusClasses(isFirstDay, isLastDay),
            isDragging && "shadow-lg",
          )}
          onClick={onClick}
        >
          <div className="truncate">
            {event.title} {showTime && <span className="text-[11px] opacity-70">{formatTimeWithOptionalMinutes(displayStart)}</span>}
          </div>
        </div>
      )
    }

    // For longer events, display title and time on separate lines
    return (
      <div
        className={cn(
          "px-2 py-1 text-xs font-medium cursor-pointer select-none h-full flex flex-col overflow-hidden backdrop-blur-md transition",
          getEventColorClasses(eventColor),
          getBorderRadiusClasses(isFirstDay, isLastDay),
          isDragging && "shadow-lg",
        )}
        onClick={onClick}
      >
        <div className="font-medium truncate">{event.title}</div>
        {showTime && <div className="text-[11px] opacity-70 truncate">{getEventTime()}</div>}
      </div>
    )
  }

  // Agenda view
  return (
    <button className={cn("text-left w-full p-2 rounded font-medium cursor-pointer backdrop-blur-md transition", getEventColorClasses(eventColor))} onClick={onClick}>
      <div className="font-medium">{event.title}</div>
      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          {event.allDay ? (
            <span>All day</span>
          ) : (
            <span>{formatTimeWithOptionalMinutes(displayStart)} - {formatTimeWithOptionalMinutes(displayEnd)}</span>
          )}
        </div>
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="size-3" />
            {event.location}
          </div>
        )}
      </div>
      {event.description && <div className="mt-1 text-sm">{event.description}</div>}
    </button>
  )
}
