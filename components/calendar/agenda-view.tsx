"use client"

import type React from "react"

import { useMemo } from "react"
import { addDays, format, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar/types"
import { EventItem } from "@/components/calendar/event-item"
import { RiCalendarEventLine } from "@remixicon/react"
import { getAgendaEventsForDay } from "@/components/calendar/utils"
import { AgendaDaysToShow } from "@/components/calendar/constants"

interface AgendaViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onDateSelect: (date: Date) => void
}

export function AgendaView({ currentDate, events, onEventSelect, onDateSelect }: AgendaViewProps) {
  // Show events for the next days based on constant
  const days = useMemo(() => {
    console.log("Agenda view updating with date:", currentDate.toISOString())
    return Array.from({ length: AgendaDaysToShow }, (_, i) => addDays(new Date(currentDate), i))
  }, [currentDate])

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Agenda view event clicked:", event)
    onEventSelect(event)
  }

  // Check if there are any days with events
  const hasEvents = days.some(day => getAgendaEventsForDay(events, day).length > 0);

  return (
    <div className="px-4 border-t border-border/70">
      {!hasEvents ? (
        <div className="flex flex-col items-center justify-center py-16 min-h-[70svh] text-center">
          <RiCalendarEventLine size={32} className="text-muted-foreground/50 mb-2" />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground">There are no events scheduled for this time period.</p>
        </div>
      ) : (
        days.map((day) => {
          const dayEvents = getAgendaEventsForDay(events, day)

          if (dayEvents.length === 0) return null

          return (
            <div key={day.toString()} className="my-12 border-t border-border/70 relative">
              <span className="absolute flex items-center h-6 -top-3 left-0 pe-4 sm:pe-4 bg-background text-[10px] sm:text-xs uppercase data-today:font-medium" data-today={isToday(day) || undefined}>{format(day, "d MMM, EEEE")}</span>
              <div className="space-y-2 mt-6">
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
