"use client"

import type React from "react"

import { useMemo } from "react"
import {
  addHours,
  eachHourOfInterval,
  format,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
  differenceInMinutes,
  areIntervalsOverlapping,
  differenceInDays,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { DraggableEvent } from "@/components/calendar/draggable-event"
import { DroppableCell } from "@/components/calendar/droppable-cell"
import { getEventColorClasses } from "@/components/calendar/utils"
import { useCurrentTimeIndicator } from "@/components/calendar/utils"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate: (startTime: Date) => void
}

interface PositionedEvent {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}

const HOUR_HEIGHT = 64; // in pixels

export function DayView({ currentDate, events, onEventSelect, onEventCreate }: DayViewProps) {

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate)
    return eachHourOfInterval({
      start: dayStart,
      end: addHours(dayStart, 23),
    })
  }, [currentDate])

  const dayEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return (
          isSameDay(currentDate, eventStart) ||
          isSameDay(currentDate, eventEnd) ||
          (currentDate > eventStart && currentDate < eventEnd)
        )
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [currentDate, events])

  // Get all-day events and multi-day events
  const allDayEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Include explicitly marked all-day events
      if (event.allDay) return true

      // Include events that span multiple days
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return differenceInDays(eventEnd, eventStart) >= 1
    })
  }, [dayEvents])

  // Get only single-day time-based events
  const timeEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      // Exclude all-day events
      if (event.allDay) return false

      // Exclude events that span multiple days
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return differenceInDays(eventEnd, eventStart) < 1
    })
  }, [dayEvents])

  // Process events to calculate positions
  const positionedEvents = useMemo(() => {
    const result: PositionedEvent[] = []
    const dayStart = startOfDay(currentDate)

    // Sort events by start time and duration
    const sortedEvents = [...timeEvents].sort((a, b) => {
      const aStart = new Date(a.start)
      const bStart = new Date(b.start)
      const aEnd = new Date(a.end)
      const bEnd = new Date(b.end)

      // First sort by start time
      if (aStart < bStart) return -1
      if (aStart > bStart) return 1

      // If start times are equal, sort by duration (longer events first)
      const aDuration = differenceInMinutes(aEnd, aStart)
      const bDuration = differenceInMinutes(bEnd, bStart)
      return bDuration - aDuration
    })

    // Track columns for overlapping events
    const columns: { event: CalendarEvent; end: Date }[][] = []

    sortedEvents.forEach((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      // Adjust start and end times if they're outside this day
      const adjustedStart = isSameDay(currentDate, eventStart) ? eventStart : dayStart
      const adjustedEnd = isSameDay(currentDate, eventEnd) ? eventEnd : addHours(dayStart, 24)

      // Calculate top position and height
      const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
      const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60
      const top = startHour * HOUR_HEIGHT
      const height = (endHour - startHour) * HOUR_HEIGHT

      // Find a column for this event
      let columnIndex = 0
      let placed = false

      while (!placed) {
        if (!columns[columnIndex]) {
          columns[columnIndex] = []
          placed = true
        } else {
          // Check if this event overlaps with any event in this column
          const overlaps = columns[columnIndex].some((col) =>
            areIntervalsOverlapping(
              { start: adjustedStart, end: adjustedEnd },
              { start: new Date(col.event.start), end: new Date(col.event.end) },
            ),
          )

          if (!overlaps) {
            placed = true
          } else {
            columnIndex++
          }
        }
      }

      // Add event to its column
      columns[columnIndex].push({ event, end: adjustedEnd })

      // First column takes full width, others are indented by 10% and take 90% width
      const width = columnIndex === 0 ? 1 : 0.9
      const left = columnIndex === 0 ? 0 : columnIndex * 0.1

      result.push({
        event,
        top,
        height,
        left,
        width,
        zIndex: 10 + columnIndex, // Higher columns get higher z-index
      })
    })

    return result
  }, [timeEvents, currentDate, HOUR_HEIGHT])

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const showAllDaySection = allDayEvents.length > 0
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "day")

  return (
    <>
      {showAllDaySection && (
        <div className="border-b p-2">
          <div className="text-xs font-medium text-muted-foreground mb-1">All day</div>
          <div className="space-y-1">
            {allDayEvents.map((event) => {
              const eventStart = new Date(event.start)
              const eventEnd = new Date(event.end)
              const isMultiDay = differenceInDays(eventEnd, eventStart) >= 1
              const isFirstDay = isSameDay(currentDate, eventStart)
              const isLastDay = isSameDay(currentDate, eventEnd)

              // Only make single-day all-day events draggable
              if (!isMultiDay) {
                return (
                  <div key={event.id} onClick={(e) => e.stopPropagation()} className="mb-1">
                    <DraggableEvent
                      event={event}
                      view="day"
                      onClick={(e) => handleEventClick(event, e)}
                      isFirstDay={true}
                      isLastDay={true}
                    />
                  </div>
                )
              } else {
                // Non-draggable version for multi-day events
                return (
                  <div
                    key={`spanning-${event.id}`}
                    className={cn(
                      "px-2 py-1 text-xs cursor-pointer select-none backdrop-blur-md transition mb-1",
                      getEventColorClasses(event.color),
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
                    {/* Always show the title in day view for better usability */}
                    <div>{event.title}</div>
                  </div>
                )
              }
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr] flex-1" style={{ "--hour-height": `${HOUR_HEIGHT}px` } as React.CSSProperties }>
        <div>
          {hours.map((hour) => (
            <div key={hour.toString()} className="h-[var(--hour-height)] border-b border-border/70 last:border-b-0 relative">
              <span className="absolute h-4 -top-2 left-0 pe-2 sm:pe-4 bg-background text-[10px] sm:text-xs text-muted-foreground/70 w-16 max-w-full text-right">{format(hour, "h a")}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          {/* Time grid */}
          {hours.map((hour) => {
            const hourValue = getHours(hour)
            return (
              <div key={hour.toString()} className="h-[var(--hour-height)] border-b border-border/70 last:border-b-0 relative">
                {/* Quarter-hour intervals */}
                {[0, 1, 2, 3].map((quarter) => {
                  const quarterHourTime = hourValue + quarter * 0.25
                  return (
                    <DroppableCell
                      key={`${hour.toString()}-${quarter}`}
                      id={`day-cell-${currentDate.toISOString()}-${quarterHourTime}`}
                      date={currentDate}
                      time={quarterHourTime}
                      className={cn(
                        "absolute w-full h-[calc(var(--hour-height)/4)]",
                        quarter === 0 && "top-0",
                        quarter === 1 && "top-[calc(var(--hour-height)/4)]",
                        quarter === 2 && "top-[calc(var(--hour-height)/4*2)]",
                        quarter === 3 && "top-[calc(var(--hour-height)/4*3)]",
                      )}
                      onClick={() => {
                        const startTime = new Date(currentDate)
                        startTime.setHours(hourValue)
                        startTime.setMinutes(quarter * 15)
                        onEventCreate(startTime)
                      }}
                    />
                  )
                })}
              </div>
            )
          })}

          {/* Positioned events */}
          {positionedEvents.map((positionedEvent) => (
            <div
              key={positionedEvent.event.id}
              className="absolute z-10 px-0.5"
              style={{
                top: `${positionedEvent.top}px`,
                height: `${positionedEvent.height}px`,
                left: `${positionedEvent.left * 100}%`,
                width: `${positionedEvent.width * 100}%`,
                zIndex: positionedEvent.zIndex,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full w-full">
                <DraggableEvent
                  event={positionedEvent.event}
                  view="day"
                  onClick={(e) => handleEventClick(positionedEvent.event, e)}
                  showTime
                  height={positionedEvent.height}
                />
              </div>
            </div>
          ))}

          {/* Current time indicator */}
          {currentTimeVisible && (
            <div 
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="relative flex items-center">
                <div className="absolute -left-1 w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-full h-[2px] bg-primary"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
