"use client"

import { useState } from "react"
import { addDays, addHours } from "date-fns"
import { Calendar } from "@/components/calendar/calendar"
import type { CalendarEvent } from "@/components/calendar/types"

// Sample events data
const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    description: "Weekly team sync",
    start: addHours(new Date(), 1),
    end: addHours(new Date(), 2),
    color: "blue",
    location: "Conference Room A",
  },
  {
    id: "2",
    title: "Lunch with Client",
    description: "Discuss new project requirements",
    start: addHours(addDays(new Date(), 1), 12),
    end: addHours(addDays(new Date(), 1), 13),
    color: "green",
    location: "Downtown Cafe",
  },
  {
    id: "3",
    title: "Product Launch",
    description: "New product release",
    start: addDays(new Date(), 3),
    end: addDays(new Date(), 6),
    allDay: true,
    color: "purple",
  },
  {
    id: "4",
    title: "Call with Lisa",
    description: "Discuss about new clients",
    start: addHours(addDays(new Date(), 4), 14),
    end: addHours(addDays(new Date(), 5), 14),
    color: "pink",
    location: "Downtown Cafe",
  },
  {
    id: "5",
    title: "Team Meeting",
    description: "Weekly team sync",
    start: addDays(new Date(), 5),
    end: addDays(new Date(), 5),
    color: "yellow",
    location: "Conference Room A",
  },
  {
    id: "6",
    title: "Review contracts",
    description: "Weekly team sync",
    start: addDays(new Date(), 5),
    end: addDays(new Date(), 5),
    color: "blue",
    location: "Conference Room A",
  },
]

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event])
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
  }

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      <div className="flex-1 border rounded-lg overflow-hidden">
        <Calendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
      </div>
    </main>
  )
}

