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

interface EventWrapperProps {
  event: CalendarEvent
  isFirstDay?: boolean
  isLastDay?: boolean
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  children: React.ReactNode
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children
}: EventWrapperProps) {
  return (
    <div
      className={cn(
        "font-medium select-none backdrop-blur-md transition h-full flex overflow-hidden px-1 sm:px-2",
        getEventColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        isDragging && "shadow-lg",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface EventItemProps {
  event: CalendarEvent
  view: "month" | "week" | "day" | "agenda"
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  currentTime?: Date // For updating time during drag
  isFirstDay?: boolean
  isLastDay?: boolean
  children?: React.ReactNode
  className?: string
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
  children,
  className,
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
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "h-[var(--event-height)] mt-[var(--event-gap)] items-center text-[10px] sm:text-xs",
          className
        )}
      >
        {children || (
          <span className="truncate">
            {!event.allDay && <span className="text-[11px] opacity-70 truncate">{formatTimeWithOptionalMinutes(displayStart)} </span>}
            {event.title}
          </span>    
        )}
      </EventWrapper>
    )
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className
        )}
      >
        {durationMinutes < 45 ? (
          <div className="truncate">
            {event.title} {showTime && <span className={cn("opacity-70", view === "week" ? "m:text-[11px]" : "text-[11px]")}>{formatTimeWithOptionalMinutes(displayStart)}</span>}
          </div>
        ) : (
          <>
            <div className="font-medium truncate">{event.title}</div>
            {showTime && <div className="text-[11px] opacity-70 truncate">{getEventTime()}</div>}          
          </>
        )}
      </EventWrapper>
    )
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button className={cn("text-left w-full p-2 rounded font-medium backdrop-blur-md transition", getEventColorClasses(eventColor), className)} onClick={onClick}>
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
