"use client"

import { useContext } from "react"
import { CalendarDndContext } from "@/components/full-calendar/calendar-dnd-context"

export const useCalendarDnd = () => useContext(CalendarDndContext)
