"use client"

import type React from "react"
import { useMemo, useEffect, useState } from "react"

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
import { useEventVisibility } from "@/hooks/use-event-visibility"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate: (startTime: Date) => void
}

const EVENT_HEIGHT = 24; // in pixels
const EVENT_GAP = 4; // in pixels

export function MonthView({ currentDate, events, onDateSelect, onEventSelect, onEventCreate }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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

  // Helper function to determine if an event is multi-day
  const isMultiDayEvent = (event: CalendarEvent) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return differenceInDays(eventEnd, eventStart) >= 1 || event.allDay
  }

  // Helper function to sort events (multi-day first, then by start time)
  const sortEvents = (events: CalendarEvent[]) => {
    return [...events].sort((a, b) => {
      const aIsMultiDay = isMultiDayEvent(a)
      const bIsMultiDay = isMultiDayEvent(b)

      if (aIsMultiDay && !bIsMultiDay) return -1
      if (!aIsMultiDay && bIsMultiDay) return 1

      return new Date(a.start).getTime() - new Date(b.start).getTime()
    })
  }

  // Get events that start on this day
  const getEventsForDay = (day: Date) => {
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.start)
      return isSameDay(day, eventStart)
    })
    
    return sortEvents(dayEvents)
  }

  // Get multi-day events that span across this day (but don't start on this day)
  const getSpanningEventsForDay = (day: Date) => {
    const spanningEvents = events.filter(event => {
      if (!isMultiDayEvent(event)) return false
      
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      
      // Only include if it's not the start day but is either the end day or a middle day
      return !isSameDay(day, eventStart) && 
             (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    })
    
    return sortEvents(spanningEvents)
  }

  // Get all events visible on this day (starting, ending, or spanning)
  const getAllEventsForDay = (day: Date) => {
    const allEvents = events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return isSameDay(day, eventStart) || 
             isSameDay(day, eventEnd) || 
             (day > eventStart && day < eventEnd)
    })
    
    return sortEvents(allEvents)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

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

  const [isMounted, setIsMounted] = useState(false);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EVENT_HEIGHT,
    eventGap: EVENT_GAP
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid auto-rows-fr" style={{ "--event-height": `${EVENT_HEIGHT}px`, "--event-gap": `${EVENT_GAP}px` } as React.CSSProperties}>
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 [&:last-child>*]:border-b-0">
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day)
              const spanningEvents = getSpanningEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const cellId = `month-cell-${day.toISOString()}`
              const allDayEvents = [...spanningEvents, ...dayEvents]
              const allEvents = getAllEventsForDay(day)

              const isReferenceCell = weekIndex === 0 && dayIndex === 0;
              const visibleCount = isMounted ? getVisibleEventCount(allDayEvents.length) : undefined;
              const hasMore = visibleCount !== undefined && allDayEvents.length > visibleCount;
              const remainingCount = hasMore ? allDayEvents.length - visibleCount : 0;

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "border-b border-r last:border-r-0 border-border/50 data-[today]:bg-blue-50 dark:data-[today]:bg-blue-950/20 data-[outside-cell]:bg-muted/25",
                  )}
                  data-today={isToday(day) || undefined}
                  data-outside-cell={!isCurrentMonth || undefined}
                >
                  <DroppableCell
                    id={cellId}
                    date={day}
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
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div 
                      ref={isReferenceCell ? contentRef : null}
                      className="overflow-hidden min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                    >
                      {allDayEvents.map((event, index) => {
                        const eventStart = new Date(event.start)
                        const eventEnd = new Date(event.end)
                        const isFirstDay = isSameDay(day, eventStart)
                        const isLastDay = isSameDay(day, eventEnd)

                        const isHidden = isMounted && visibleCount && index >= visibleCount;

                        if (!visibleCount) return null;

                        if (!isFirstDay) {
                          return (
                            <div 
                              key={`spanning-${event.id}`} 
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "mt-[var(--event-gap)]",
                                isHidden ? "hidden" : ""
                              )}
                              aria-hidden={isHidden ? "true" : undefined}
                            >
                              <div
                                className={cn(
                                  "h-[var(--event-height)] flex items-center px-1 sm:px-2 text-[10px] sm:text-xs cursor-pointer select-none",
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
                                <div className="invisible" aria-hidden={true}>
                                  {!event.allDay && <span>{format(new Date(event.start), "h:mm")} </span>}
                                  {event.title}
                                </div>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div 
                            key={event.id} 
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "mt-[var(--event-gap)]",
                              isHidden ? "hidden" : ""
                            )}
                            aria-hidden={isHidden ? "true" : undefined}
                          >
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

                      {hasMore && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              type="button"
                              className="w-full mt-[var(--event-gap)] text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="h-[var(--event-height)] flex items-center px-1 sm:px-2 text-[10px] sm:text-xs truncate cursor-pointer select-none text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded"
                              >
                                <span>
                                  + {remainingCount} <span className="max-sm:sr-only">more</span>
                                </span>
                              </div>
                            </button>
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
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
