"use client"

import {
  createContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { differenceInMinutes } from "date-fns"

import { EventItem } from "@/components/full-calendar/event-item"
import type { CalendarEvent } from "@/components/full-calendar/types"

// Define the context type
type CalendarDndContextType = {
  activeEvent: CalendarEvent | null
  activeId: UniqueIdentifier | null
  activeView: "month" | "week" | "day" | null
  currentTime: Date | null
  eventHeight: number | null
  isMultiDay: boolean
  multiDayWidth: number | null
  dragHandlePosition: {
    x?: number
    y?: number
    data?: {
      isFirstDay?: boolean
      isLastDay?: boolean
    }
  } | null
}

// Create the context
export const CalendarDndContext = createContext<CalendarDndContextType>({
  activeEvent: null,
  activeId: null,
  activeView: null,
  currentTime: null,
  eventHeight: null,
  isMultiDay: false,
  multiDayWidth: null,
  dragHandlePosition: null,
})

// Props for the provider
interface CalendarDndProviderProps {
  children: ReactNode
  onEventUpdate: (event: CalendarEvent) => void
}

export function CalendarDndProvider({
  children,
  onEventUpdate,
}: CalendarDndProviderProps) {
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeView, setActiveView] = useState<"month" | "week" | "day" | null>(
    null
  )
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [eventHeight, setEventHeight] = useState<number | null>(null)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [multiDayWidth, setMultiDayWidth] = useState<number | null>(null)
  const [dragHandlePosition, setDragHandlePosition] = useState<{
    x?: number
    y?: number
    data?: {
      isFirstDay?: boolean
      isLastDay?: boolean
    }
  } | null>(null)

  // Store original event dimensions
  const eventDimensions = useRef<{ height: number }>({ height: 0 })

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 5px before activating
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      // Require the pointer to move by 5px before activating
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Generate a stable ID for the DndContext
  const dndContextId = useId()

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    // Add safety check for data.current
    if (!active.data.current) {
      console.error("Missing data in drag start event", event)
      return
    }

    const {
      event: calendarEvent,
      view,
      height,
      isMultiDay: eventIsMultiDay,
      multiDayWidth: eventMultiDayWidth,
      dragHandlePosition: eventDragHandlePosition,
    } = active.data.current as {
      event: CalendarEvent
      view: "month" | "week" | "day"
      height?: number
      isMultiDay?: boolean
      multiDayWidth?: number
      dragHandlePosition?: {
        x?: number
        y?: number
        data?: {
          isFirstDay?: boolean
          isLastDay?: boolean
        }
      }
    }

    setActiveEvent(calendarEvent)
    setActiveId(active.id)
    setActiveView(view)
    setCurrentTime(new Date(calendarEvent.start))
    setIsMultiDay(eventIsMultiDay || false)
    setMultiDayWidth(eventMultiDayWidth || null)
    setDragHandlePosition(eventDragHandlePosition || null)

    // Store event height if provided
    if (height) {
      eventDimensions.current.height = height
      setEventHeight(height)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event

    if (over && activeEvent && over.data.current) {
      const { date, time } = over.data.current as { date: Date; time?: number }

      // Update time for week/day views
      if (time !== undefined && activeView !== "month") {
        const newTime = new Date(date)

        // Calculate hours and minutes with 15-minute precision
        const hours = Math.floor(time)
        const fractionalHour = time - hours

        // Map to nearest 15 minute interval (0, 0.25, 0.5, 0.75)
        let minutes = 0
        if (fractionalHour < 0.125) minutes = 0
        else if (fractionalHour < 0.375) minutes = 15
        else if (fractionalHour < 0.625) minutes = 30
        else minutes = 45

        newTime.setHours(hours, minutes, 0, 0)

        // Only update if time has changed
        if (
          !currentTime ||
          newTime.getHours() !== currentTime.getHours() ||
          newTime.getMinutes() !== currentTime.getMinutes() ||
          newTime.getDate() !== currentTime.getDate() ||
          newTime.getMonth() !== currentTime.getMonth() ||
          newTime.getFullYear() !== currentTime.getFullYear()
        ) {
          setCurrentTime(newTime)
        }
      } else if (activeView === "month") {
        // For month view, just update the date
        const newDate = new Date(date)
        
        // Only update if date has changed
        if (
          !currentTime ||
          newDate.getDate() !== currentTime.getDate() ||
          newDate.getMonth() !== currentTime.getMonth() ||
          newDate.getFullYear() !== currentTime.getFullYear()
        ) {
          setCurrentTime(newDate)
        }
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Reset state
    setActiveEvent(null)
    setActiveId(null)
    setActiveView(null)
    setCurrentTime(null)
    setEventHeight(null)
    setIsMultiDay(false)
    setMultiDayWidth(null)
    setDragHandlePosition(null)

    // Handle drop
    if (
      over &&
      active.data.current &&
      over.data.current &&
      activeEvent &&
      currentTime
    ) {
      // Destructure only what we need from over.data.current
      const { event: originalEvent } = active.data.current as {
        event: CalendarEvent
      }

      // Create a copy of the event to modify
      const updatedEvent = { ...originalEvent } as CalendarEvent

      // Calculate the time difference between original start and current time
      const originalStart = new Date(originalEvent.start)
      const timeDiff = differenceInMinutes(currentTime, originalStart)

      // Apply the time difference to both start and end
      const newStart = new Date(originalEvent.start)
      newStart.setMinutes(newStart.getMinutes() + timeDiff)
      updatedEvent.start = newStart

      const newEnd = new Date(originalEvent.end)
      newEnd.setMinutes(newEnd.getMinutes() + timeDiff)
      updatedEvent.end = newEnd

      // Call the update callback
      onEventUpdate(updatedEvent)
    }
  }

  return (
    <CalendarDndContext.Provider
      value={{
        activeEvent,
        activeId,
        activeView,
        currentTime,
        eventHeight,
        isMultiDay,
        multiDayWidth,
        dragHandlePosition,
      }}
    >
      <DndContext
        id={dndContextId}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeEvent && activeId ? (
            <EventItem
              event={activeEvent}
              view={activeView || "day"}
              isDragging
              isFirstDay={dragHandlePosition?.data?.isFirstDay}
              isLastDay={dragHandlePosition?.data?.isLastDay}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </CalendarDndContext.Provider>
  )
}
