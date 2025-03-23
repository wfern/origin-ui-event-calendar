export type CalendarView = "month" | "week" | "day" | "agenda"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: EventColor
  location?: string
}

export type EventColor = "blue" | "green" | "red" | "yellow" | "purple" | "pink" | "orange"

export interface TimeSlot {
  start: Date
  end: Date
}

export interface DragState {
  active: boolean
  event: CalendarEvent | null
  initialPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
}

