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
} from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { DraggableEvent } from "@/components/calendar/draggable-event"
import { DroppableCell } from "@/components/calendar/droppable-cell"
import { EventHeight, EventGap } from "@/components/calendar/constants"
import { getEventsForDay, getSpanningEventsForDay, getAllEventsForDay, sortEvents } from "@/components/calendar/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEventVisibility } from "@/hooks/use-event-visibility"
import { EventItem } from "@/components/calendar/event-item"

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

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const [isMounted, setIsMounted] = useState(false);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EventHeight,
    eventGap: EventGap
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <div className="grid grid-cols-7 border-b border-border/70">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-center text-sm text-muted-foreground/70">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 [&:last-child>*]:border-b-0">
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day)
              const spanningEvents = getSpanningEventsForDay(events, day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const cellId = `month-cell-${day.toISOString()}`
              const allDayEvents = [...spanningEvents, ...dayEvents]
              const allEvents = getAllEventsForDay(events, day)

              const isReferenceCell = weekIndex === 0 && dayIndex === 0;
              const visibleCount = isMounted ? getVisibleEventCount(allDayEvents.length) : undefined;
              const hasMore = visibleCount !== undefined && allDayEvents.length > visibleCount;
              const remainingCount = hasMore ? allDayEvents.length - visibleCount : 0;

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "group border-b border-r last:border-r-0 border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70",
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
                    <div
                      className="inline-flex size-6 items-center justify-center rounded-full text-sm mt-1 group-data-today:bg-primary group-data-today:text-primary-foreground">
                      {format(day, "d")}
                    </div>
                    <div
                      ref={isReferenceCell ? contentRef : null}
                      className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                    >
                      {sortEvents(allDayEvents).map((event, index) => {
                        const eventStart = new Date(event.start)
                        const eventEnd = new Date(event.end)
                        const isFirstDay = isSameDay(day, eventStart)
                        const isLastDay = isSameDay(day, eventEnd)

                        const isHidden = isMounted && visibleCount && index >= visibleCount;

                        if (!visibleCount) return null;

                        if (!isFirstDay) {
                          return (
                            <EventItem
                              key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`}
                              onClick={(e) => handleEventClick(event, e)}
                              className={cn(
                                isHidden && "hidden"
                              )}
                              aria-hidden={isHidden ? "true" : undefined}
                              event={event}
                              view="month"
                              isFirstDay={isFirstDay}
                              isLastDay={isLastDay}
                            >
                              <div className="invisible" aria-hidden={true}>
                              {!event.allDay && <span>{format(new Date(event.start), "h:mm")} </span>}
                              {event.title}</div>
                            </EventItem>
                          )
                        }

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "mt-[var(--event-gap)]",
                              isHidden && "hidden" 
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
                        <Popover modal>
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
                          <PopoverContent align="center" className="p-3 max-w-52" style={{ "--event-height": `${EventHeight}px` } as React.CSSProperties}>
                            <div className="space-y-2">
                              <div className="text-sm font-medium">{format(day, "EEE d")}</div>
                              <div className="space-y-1">
                                {sortEvents(allEvents).map((event) => {
                                  const eventStart = new Date(event.start)
                                  const eventEnd = new Date(event.end)
                                  const isFirstDay = isSameDay(day, eventStart)
                                  const isLastDay = isSameDay(day, eventEnd)

                                  return (
                                    <EventItem
                                      key={event.id}
                                      event={event}
                                      view="month"
                                      isFirstDay={isFirstDay}
                                      isLastDay={isLastDay}
                                    />
                                  )
                                })}
                              </div>
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
