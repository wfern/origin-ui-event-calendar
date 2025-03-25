"use client"

import type React from "react"

import { useMemo } from "react"
import { addDays, format, isSameDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { EventItem } from "@/components/calendar/event-item"
import { RiCalendarEventLine } from "@remixicon/react"
import { getAgendaEventsForDay } from "@/components/calendar/utils"

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
    return getAgendaEventsForDay(events, day)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Agenda view event clicked:", event)
    onEventSelect(event)
  }

  // Check if there are any days with events
  const hasEvents = days.some(day => getEventsForDay(day).length > 0);

  return (
    <div className="p-4">
      {!hasEvents ? (
        <div className="flex flex-col items-center justify-center py-16 min-h-[70svh] text-center">
          <RiCalendarEventLine size={32} className="text-muted-foreground/50 mb-2" />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground">There are no events scheduled for this time period.</p>
        </div>
      ) : (
        days.map((day) => {
          const dayEvents = getEventsForDay(day)

          if (dayEvents.length === 0) return null

          return (
            <div key={day.toString()} className="mb-6">
              <div
                className={cn("flex items-center gap-2 mb-2 cursor-pointer", isToday(day) && "text-primary font-medium")}
                onClick={() => onDateSelect(day)}
              >
                <div className="text-sm font-medium">{format(day, "d")}</div>
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
        })
      )}
    </div>
  )
}
