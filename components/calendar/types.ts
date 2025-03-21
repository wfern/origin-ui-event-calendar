export type CalendarView = "month" | "week" | "day" | "agenda"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  location?: string
}

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

