import { format, differenceInDays, isSameDay } from "date-fns"
import type { CalendarEvent, EventColor } from "@/components/calendar/types"

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(color: EventColor | string): string {
  switch (color) {
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

/**
 * Get CSS classes for event colors in agenda view
 */
export function getAgendaEventColorClasses(color: EventColor | string): string {
  switch (color) {
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

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(isFirstDay: boolean, isLastDay: boolean): string {
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

