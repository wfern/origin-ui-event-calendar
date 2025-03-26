"use client"

import { useEffect, useRef } from "react"
import { format, isSameDay } from "date-fns"
import { XIcon } from "lucide-react"

import { EventItem, type CalendarEvent } from "@/components/full-calendar"

interface EventsPopupProps {
  date: Date
  events: CalendarEvent[]
  position: { top: number; left: number }
  onClose: () => void
  onEventSelect: (event: CalendarEvent) => void
}

export function EventsPopup({
  date,
  events,
  position,
  onClose,
  onEventSelect,
}: EventsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handleEventClick = (event: CalendarEvent) => {
    onEventSelect(event)
    onClose()
  }

  // Adjust position to ensure popup stays within viewport
  const adjustedPosition = { ...position }

  useEffect(() => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Adjust horizontal position if needed
      if (rect.right > viewportWidth) {
        adjustedPosition.left = Math.max(0, viewportWidth - rect.width)
      }

      // Adjust vertical position if needed
      if (rect.bottom > viewportHeight) {
        adjustedPosition.top = Math.max(0, position.top - rect.height)
      }
    }
  }, [position])

  return (
    <div
      ref={popupRef}
      className="bg-background absolute z-50 max-h-96 w-80 overflow-auto rounded-md border shadow-lg"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
    >
      <div className="bg-background sticky top-0 flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{format(date, "d MMMM yyyy")}</h3>
        <button
          onClick={onClose}
          className="hover:bg-muted rounded-full p-1"
          aria-label="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 p-3">
        {events.length === 0 ? (
          <div className="text-muted-foreground py-2 text-sm">No events</div>
        ) : (
          events.map((event) => {
            const eventStart = new Date(event.start)
            const eventEnd = new Date(event.end)
            const isFirstDay = isSameDay(date, eventStart)
            const isLastDay = isSameDay(date, eventEnd)

            return (
              <div
                key={event.id}
                className="cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <EventItem
                  event={event}
                  view="agenda"
                  isFirstDay={isFirstDay}
                  isLastDay={isLastDay}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
