import { format, differenceInDays, isSameDay } from "date-fns"
import type { CalendarEvent, EventColor } from "@/components/calendar/types"

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color?: EventColor | string): string {
  const eventColor = color || "sky";
  
  switch (eventColor) {
    case "sky":
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80"
    case "amber":
      return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80"
    case "violet":
      return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80"
    case "rose":
      return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80"
    case "emerald":
      return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80"
    case "orange":
      return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80"
    default:
      return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80"
  }
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(isFirstDay: boolean, isLastDay: boolean): string {
  if (isFirstDay && isLastDay) {
    return "rounded" // Both ends rounded
  } else if (isFirstDay) {
    return "rounded-l rounded-r-none" // Only left end rounded
  } else if (isLastDay) {
    return "rounded-r rounded-l-none" // Only right end rounded
  } else {
    return "rounded-none" // No rounded corners
  }
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  return event.allDay || differenceInDays(eventEnd, eventStart) >= 1
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd)
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

/**
 * Format event time for display
 */
export function formatEventTime(event: CalendarEvent, durationMinutes: number): string {
  if (event.allDay) return "All day"

  const displayStart = new Date(event.start)
  const displayEnd = new Date(event.end)

  // For short events (less than 45 minutes), only show start time
  if (durationMinutes < 45) {
    return format(displayStart, "h:mm a")
  }

  // For longer events, show both start and end time
  return `${format(displayStart, "h:mm a")} - ${format(displayEnd, "h:mm a")}`
}

/**
 * Generate a unique ID for new events
 */
export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}
