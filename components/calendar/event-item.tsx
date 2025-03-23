"use client"

import type React from "react"

import { format, differenceInMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { Clock, MapPin } from "lucide-react"
import { useMemo } from "react"

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
  const eventColor = event.color || "blue"

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
      return format(displayStart, "h:mm a")
    }

    // For longer events, show both start and end time
    return `${format(displayStart, "h:mm a")} - ${format(displayEnd, "h:mm a")}`
  }

  // Helper function to get color classes based on the event color
  const getColorClasses = () => {
    switch (eventColor) {
      case "blue":
        return "bg-blue-100/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-500"
      case "green":
        return "bg-green-100/50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-500"
      case "red":
        return "bg-red-100/50 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-500"
      case "yellow":
        return "bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-500"
      case "purple":
        return "bg-purple-100/50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-500"
      case "pink":
        return "bg-pink-100/50 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-500"
      case "orange":
        return "bg-orange-100/50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-500"
      default:
        return "bg-blue-100/50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-500"
    }
  }

  // Helper function to get agenda color classes
  const getAgendaColorClasses = () => {
    switch (eventColor) {
      case "blue":
        return "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
      case "green":
        return "border-green-500 bg-green-50/50 dark:bg-green-900/20"
      case "red":
        return "border-red-500 bg-red-50/50 dark:bg-red-900/20"
      case "yellow":
        return "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20"
      case "purple":
        return "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20"
      case "pink":
        return "border-pink-500 bg-pink-50/50 dark:bg-pink-900/20"
      case "orange":
        return "border-orange-500 bg-orange-50/50 dark:bg-orange-900/20"
      default:
        return "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
    }
  }

  // Determine border radius based on position in multi-day event
  const getBorderRadiusClasses = () => {
    if (isFirstDay && isLastDay) {
      return "rounded-md" // Both ends rounded
    } else if (isFirstDay) {
      return "rounded-l-md rounded-r-none" // Only left end rounded
    } else if (isLastDay) {
      return "rounded-r-md rounded-l-none" // Only right end rounded
    } else {
      return "rounded-none" // No rounded corners
    }
  }

  if (view === "month") {
    return (
      <div
        className={cn(
          "px-0.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs truncate cursor-pointer select-none",
          getColorClasses(),
          getBorderRadiusClasses(),
          isDragging && "opacity-70 shadow-md",
        )}
        onClick={onClick}
      >
        {!event.allDay && <span>{format(displayStart, "h:mm")} </span>}
        {event.title}
      </div>
    )
  }

  if (view === "week" || view === "day") {
    // For short events (less than 45 minutes), display title and time on the same line
    if (durationMinutes < 45) {
      return (
        <div
          className={cn(
            "px-2 py-1 text-xs cursor-pointer select-none h-full flex items-center overflow-hidden",
            getColorClasses(),
            getBorderRadiusClasses(),
            isDragging ? "opacity-90 shadow-md" : "",
          )}
          onClick={onClick}
        >
          <div className="truncate">
            {event.title} {showTime && <span className="opacity-80">{format(displayStart, "h:mm a")}</span>}
          </div>
        </div>
      )
    }

    // For longer events, display title and time on separate lines
    return (
      <div
        className={cn(
          "px-2 py-1 text-xs cursor-pointer select-none h-full flex flex-col overflow-hidden",
          getColorClasses(),
          getBorderRadiusClasses(),
          isDragging ? "opacity-90 shadow-md" : "",
        )}
        onClick={onClick}
      >
        <div className="font-medium truncate">{event.title}</div>
        {showTime && <div className="text-xs opacity-80 truncate">{getEventTime()}</div>}
      </div>
    )
  }

  // Agenda view
  return (
    <div className={cn("p-2 rounded-md border-l-4 cursor-pointer", getAgendaColorClasses())} onClick={onClick}>
      <div className="font-medium">{event.title}</div>
      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {getEventTime()}
        </div>
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </div>
        )}
      </div>
      {event.description && <div className="mt-1 text-sm">{event.description}</div>}
    </div>
  )
}

