"use client"

import { useState, useMemo, useEffect, useId } from "react"
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
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { CalendarEvent, CalendarView } from "@/components/calendar/types"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { AgendaView } from "@/components/calendar/agenda-view"
import { EventDialog } from "@/components/calendar/event-dialog"
import { CalendarDndProvider } from "@/hooks/use-calendar-dnd"
import { EventHeight, EventGap, WeekCellsHeight } from "@/components/calendar/constants"
import { addHoursToDate } from "@/components/calendar/utils"
import { RiCalendarCheckLine } from "@remixicon/react"

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
  const eventId = useId()

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month")
          break
        case "w":
          setView("week")
          break
        case "d":
          setView("day")
          break
        case "a":
          setView("agenda")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEventDialogOpen])

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
        id: Math.random().toString(36).substring(2, 11),
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
      return format(currentDate, "EEE MMMM d, yyyy")
    } else {
      return format(currentDate, "MMMM yyyy")
    }
  }, [currentDate, view])

  return (
    <div 
      className="border rounded-lg overflow-hidden flex-1 flex flex-col" 
      style={{
        "--event-height": `${EventHeight}px`, 
        "--event-gap": `${EventGap}px`, 
        "--week-cells-height": `${WeekCellsHeight}px`
      } as React.CSSProperties} 
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div className={cn("flex items-center justify-between p-2 sm:p-4 border-b border-border/70", className)}>
          <div className="flex items-center gap-1 sm:gap-4">
            <Button variant="outline" className="aspect-square max-[480px]:p-0 max-[480px]:size-8" onClick={handleToday}>
              <RiCalendarCheckLine className="min-[480px]:hidden" size={16} aria-hidden="true" />
              <span className="max-[480px]:sr-only">Today</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button variant="ghost" size="icon" className="max-[480px]:size-8" onClick={handlePrevious} aria-label="Previous">
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" className="max-[480px]:size-8" onClick={handleNext} aria-label="Next">
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>            
            </div>
            <h2 className="text-sm sm:text-lg md:text-xl font-semibold">{viewTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-[480px]:h-8 gap-1.5">
                  <span><span className="min-[480px]:hidden" aria-hidden="true">{view.charAt(0).toUpperCase()}</span><span className="max-[480px]:sr-only">{view.charAt(0).toUpperCase() + view.slice(1)}</span></span>
                  <ChevronDownIcon className="-me-1 opacity-60" size={16} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setView("month")}>
                  Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("week")}>
                  Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("day")}>
                  Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("agenda")}>
                  Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              size="sm" 
              className="aspect-square max-sm:p-0 max-[480px]:size-8"
              onClick={() => {
                setSelectedEvent(null) // Ensure we're creating a new event
                setIsEventDialogOpen(true)
              }}
            >
              <PlusIcon className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">New event</span>
            </Button>            
          </div>
        </div>

        <div className="flex-1 flex flex-col">
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
