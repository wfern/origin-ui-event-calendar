"use client"

import { useEffect, useRef } from "react"
import { format, isSameDay } from "date-fns"
import { X } from "lucide-react"
import type { CalendarEvent } from "@/components/calendar/types"
import { EventItem } from "@/components/calendar/event-item"

interface EventsPopupProps {
  date: Date
  events: CalendarEvent[]
  position: { top: number; left: number }
  onClose: () => void
  onEventSelect: (event: CalendarEvent) => void
}

export function EventsPopup({ date, events, position, onClose, onEventSelect }: EventsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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
      className="absolute z-50 bg-background border rounded-md shadow-lg w-80 max-h-96 overflow-auto"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
      }}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-background">
        <h3 className="font-medium">{format(date, "d MMMM yyyy")}</h3>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-muted" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">No events</div>
        ) : (
          events.map((event) => {
            const eventStart = new Date(event.start)
            const eventEnd = new Date(event.end)
            const isFirstDay = isSameDay(date, eventStart)
            const isLastDay = isSameDay(date, eventEnd)

            return (
              <div key={event.id} className="cursor-pointer" onClick={() => handleEventClick(event)}>
                <EventItem event={event} view="agenda" isFirstDay={isFirstDay} isLastDay={isLastDay} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

