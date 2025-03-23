"use client"

import type React from "react"

import { useMemo } from "react"
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  differenceInDays,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { DraggableEvent } from "@/components/calendar/draggable-event"
import { DroppableCell } from "@/components/calendar/droppable-cell"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate: (startTime: Date) => void
}

export function MonthView({ currentDate, events, onDateSelect, onEventSelect, onEventCreate }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Group days into weeks for better multi-day event handling
  const weeks = useMemo(() => {
    const result = []
    let week = []

    for (let i = 0; i < days.length; i++) {
      week.push(days[i])
      if (week.length === 7 || i === days.length - 1) {
        result.push(week)
        week = []
      }
    }

    return result
  }, [days])

  const getEventsForDay = (day: Date) => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // For multi-day events, only include them on their start day
        if (differenceInDays(eventEnd, eventStart) >= 1 || event.allDay) {
          return isSameDay(day, eventStart)
        }

        // For regular events, include them on their day
        return isSameDay(day, eventStart)
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  // Add a function to get multi-day events that span this day but don't start on it
  const getSpanningEventsForDay = (day: Date) => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)

        // Only include multi-day events that span this day but don't start on it
        if ((differenceInDays(eventEnd, eventStart) >= 1 || event.allDay) && !isSameDay(day, eventStart)) {
          return isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd)
        }

        return false
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  // Get all events for a day (for the popover)
  const getAllEventsForDay = (day: Date) => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd)
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  // Add a helper function to get color classes
  const getEventColorClasses = (color: string) => {
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

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 [&:last-child>*]:border-b-0">
            {week.map((day) => {
              const dayEvents = getEventsForDay(day)
              const spanningEvents = getSpanningEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = isSameDay(day, currentDate)
              const cellId = `month-cell-${day.toISOString()}`
              const allDayEvents = [...dayEvents, ...spanningEvents]
              const allEvents = getAllEventsForDay(day)

              return (
                <DroppableCell
                  key={day.toString()}
                  id={cellId}
                  date={day}
                  outsideDay={!isCurrentMonth}
                  className={cn(
                    "h-24 sm:h-[7.5rem] lg:h-[9.25rem] flex flex-col p-0.5 sm:p-1 border-b border-r last:border-r-0 border-border/50 relative",
                    isToday(day) && "bg-blue-50 dark:bg-blue-950/20",
                  )}
                  onClick={() => {
                    const startTime = new Date(day)
                    startTime.setHours(9, 0, 0) // Default to 9:00 AM
                    onEventCreate(startTime)
                  }}
                >
                  <div className="flex justify-between">
                    <span
                      className={cn(
                        "inline-flex size-6 items-center justify-center rounded-full text-sm mt-1",
                        isToday(day) && "bg-primary text-primary-foreground font-medium",
                        isSelected && !isToday(day) && "bg-muted font-medium",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5 sm:space-y-1 flex-1 overflow-hidden">
                    {/* Show spanning events first (non-draggable) */}
                    {spanningEvents.slice(0, 3).map((event) => {
                      const eventStart = new Date(event.start)
                      const eventEnd = new Date(event.end)
                      const isFirstDay = isSameDay(day, eventStart)
                      const isLastDay = isSameDay(day, eventEnd)

                      return (
                        <div key={`spanning-${event.id}`} onClick={(e) => e.stopPropagation()}>
                          <div
                            className={cn(
                              "px-0.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs truncate cursor-pointer select-none",
                              getEventColorClasses(event.color || "blue"),
                              isFirstDay && isLastDay
                                ? "rounded-md"
                                : isFirstDay
                                  ? "rounded-l-md rounded-r-none"
                                  : isLastDay
                                    ? "rounded-r-md rounded-l-none"
                                    : "rounded-none",
                            )}
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            <div className={cn(!isFirstDay && "invisible")} aria-hidden={!isFirstDay}>
                              {!event.allDay && <span>{format(new Date(event.start), "h:mm")} </span>}
                              {event.title}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Show draggable events */}
                    {dayEvents.slice(0, Math.max(0, 3 - spanningEvents.length)).map((event) => {
                      const eventStart = new Date(event.start)
                      const eventEnd = new Date(event.end)
                      const isMultiDay = differenceInDays(eventEnd, eventStart) >= 1 || event.allDay
                      const isFirstDay = true // Always first day in this section
                      const isLastDay = !isMultiDay || isSameDay(eventEnd, day)

                      return (
                        <div key={event.id} onClick={(e) => e.stopPropagation()}>
                          <DraggableEvent
                            event={event}
                            view="month"
                            onClick={(e) => handleEventClick(event, e)}
                            isFirstDay={isFirstDay}
                            isLastDay={isLastDay}
                          />
                        </div>
                      )
                    })}

                    {allDayEvents.length > 3 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div
                            className="px-0.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs truncate cursor-pointer select-none text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            + {allDayEvents.length - 3} more
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start" onClick={(e) => e.stopPropagation()}>
                          <div className="p-2 border-b font-medium">{format(day, "d MMMM yyyy")}</div>
                          <div className="p-2 max-h-[300px] overflow-auto space-y-1">
                            {allEvents.map((event) => {
                              const eventStart = new Date(event.start)
                              const eventEnd = new Date(event.end)
                              const isFirstDay = isSameDay(day, eventStart)
                              const isLastDay = isSameDay(day, eventEnd)

                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEventClick(event, e)
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "px-2 py-1 text-xs cursor-pointer select-none",
                                      getEventColorClasses(event.color || "blue"),
                                      isFirstDay && isLastDay
                                        ? "rounded-md"
                                        : isFirstDay
                                          ? "rounded-l-md rounded-r-none"
                                          : isLastDay
                                            ? "rounded-r-md rounded-l-none"
                                            : "rounded-none",
                                    )}
                                  >
                                    {!event.allDay && isFirstDay && <span>{format(eventStart, "h:mm")} </span>}
                                    {event.title}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </DroppableCell>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

