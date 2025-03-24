"use client"

import type React from "react"

import { useMemo } from "react"
import { addDays, format, isSameDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { EventItem } from "@/components/calendar/event-item"

interface AgendaViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onDateSelect: (date: Date) => void
}

export function AgendaView({ currentDate, events, onEventSelect, onDateSelect }: AgendaViewProps) {
  // Show events for the next 30 days
  const daysToShow = 30

  const days = useMemo(() => {
    console.log("Agenda view updating with date:", currentDate.toISOString())
    return Array.from({ length: daysToShow }, (_, i) => addDays(new Date(currentDate), i))
  }, [currentDate, daysToShow])

  const getEventsForDay = (day: Date) => {
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
    console.log("Agenda view event clicked:", event)
    onEventSelect(event)
  }

  return (
    <div className="p-4">
      {days.map((day) => {
        const dayEvents = getEventsForDay(day)

        if (dayEvents.length === 0) return null

        return (
          <div key={day.toString()} className="mb-6">
            <div
              className={cn("flex items-center gap-2 mb-2 cursor-pointer", isToday(day) && "text-primary font-medium")}
              onClick={() => onDateSelect(day)}
            >
              <div className="text-lg font-semibold">{format(day, "d")}</div>
              <div>
                <div>{format(day, "EEEE")}</div>
                <div className="text-sm text-muted-foreground">{format(day, "MMMM yyyy")}</div>
              </div>
            </div>

            <div className="space-y-2 pl-10">
              {dayEvents.map((event) => (
                <div key={event.id} className="rounded-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <EventItem event={event} view="agenda" onClick={(e) => handleEventClick(event, e)} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

