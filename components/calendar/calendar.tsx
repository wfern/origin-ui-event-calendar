"use client"

import { useState, useMemo } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  subMonths,
  subWeeks,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { CalendarEvent, CalendarView } from "@/components/calendar/types"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { AgendaView } from "@/components/calendar/agenda-view"
import { EventDialog } from "@/components/calendar/event-dialog"
import { CalendarDndProvider } from "@/hooks/use-calendar-dnd"

export interface CalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  className?: string
  initialView?: CalendarView
}

export function Calendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "month",
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>(initialView)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setCurrentDate(addDays(currentDate, -30))
    }
  }

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setCurrentDate(addDays(currentDate, 30))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEventSelect = (event: CalendarEvent) => {
    console.log("Event selected:", event) // Debug log
    setSelectedEvent(event)
    setIsEventDialogOpen(true)
  }

  const handleEventCreate = (startTime: Date) => {
    console.log("Creating new event at:", startTime) // Debug log

    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes()
    const remainder = minutes % 15
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder)
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder))
      }
      startTime.setSeconds(0)
      startTime.setMilliseconds(0)
    }

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: startTime,
      end: addHoursToDate(startTime, 1),
      allDay: false,
    }
    setSelectedEvent(newEvent)
    setIsEventDialogOpen(true)
  }

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event)
    } else {
      onEventAdd?.({
        ...event,
        id: generateId(),
      })
    }
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventDelete = (eventId: string) => {
    onEventDelete?.(eventId)
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent)
  }

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy")
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (isSameMonth(start, end)) {
        return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`
      } else {
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
      }
    } else if (view === "day") {
      return format(currentDate, "EEEE, MMMM d, yyyy")
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }, [currentDate, view])

  return (
    <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div className={cn("flex items-center justify-between p-4 border-b", className)}>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="ml-2" onClick={handleToday}>
              Today
            </Button>
            <h2 className="text-lg font-semibold ml-4">{viewTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedEvent(null) // Ensure we're creating a new event
                setIsEventDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? "" : "Create"}
            </Button>
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)} className="ml-4">
              <TabsList>
                <TabsTrigger value="month">{isMobile ? "M" : "Month"}</TabsTrigger>
                <TabsTrigger value="week">{isMobile ? "W" : "Week"}</TabsTrigger>
                <TabsTrigger value="day">{isMobile ? "D" : "Day"}</TabsTrigger>
                <TabsTrigger value="agenda">{isMobile ? "A" : "Agenda"}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-auto">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateSelect={handleDateSelect}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onDateSelect={handleDateSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false)
            setSelectedEvent(null)
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  )
}

// Helper functions
function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

