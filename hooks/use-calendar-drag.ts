"use client"

import type React from "react"

import { useState, useEffect, type RefObject } from "react"
import { addMinutes, differenceInMinutes } from "date-fns"
import type { CalendarEvent, DragState } from "@/components/calendar/types"

interface UseCalendarDragProps {
  containerRef: RefObject<HTMLDivElement>
  hourHeight: number
  dragState: DragState
  onDragMove: (position: { x: number; y: number }) => void
  onDragEnd: (newStart: Date, newEnd: Date) => void
  isWeekView?: boolean
}

interface UseCalendarDragResult {
  dragOffset: number
  setDragOffset: (offset: number) => void
  draggedEventTime: Date | null
  handleEventDragStart: (event: CalendarEvent, e: React.MouseEvent | React.TouchEvent, top: number) => void
  calculateDraggedPosition: (
    clientX: number,
    clientY: number,
  ) => {
    dayIndex: number | null
    timeOffset: number
    snappedTimeOffset: number
  }
}

export function useCalendarDrag({
  containerRef,
  hourHeight,
  dragState,
  onDragMove,
  onDragEnd,
  isWeekView = false,
}: UseCalendarDragProps): UseCalendarDragResult {
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [draggedEventTime, setDraggedEventTime] = useState<Date | null>(null)

  // Calculate current time and position for dragged event
  const calculateDraggedPosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) {
      return { dayIndex: null, timeOffset: 0, snappedTimeOffset: 0 }
    }

    const rect = containerRef.current.getBoundingClientRect()

    // Apply the drag offset to get the correct position
    const adjustedY = clientY - dragOffset

    // Calculate time based on the adjusted position
    const timeOffset = (adjustedY - rect.top) / hourHeight

    // Snap to 15-minute intervals
    const snappedTimeOffset = Math.round(timeOffset * 4) / 4

    // Calculate day index for week view
    let dayIndex = null
    if (isWeekView) {
      const dayWidth = rect.width / 8 // width of day column (including time column)
      dayIndex = Math.floor((clientX - rect.left) / dayWidth)

      // Only return valid day indices (1-7, skipping the time column)
      if (dayIndex <= 0 || dayIndex >= 8) {
        dayIndex = null
      }
    }

    return { dayIndex, timeOffset, snappedTimeOffset }
  }

  // Calculate current time for dragged event
  const calculateDraggedTime = (clientY: number) => {
    if (!containerRef.current || !dragState.event) return null

    const rect = containerRef.current.getBoundingClientRect()

    // Apply the drag offset to get the correct position
    const adjustedY = clientY - dragOffset

    // Calculate time based on the adjusted position
    const timeOffset = (adjustedY - rect.top) / hourHeight

    // Snap to 15-minute intervals
    const hours = Math.floor(timeOffset)
    const minutes = Math.round(((timeOffset - hours) * 60) / 15) * 15

    // Create a new date at the current day with the calculated time
    const newTime = new Date(dragState.event.start)
    newTime.setHours(hours)
    newTime.setMinutes(minutes)

    return newTime
  }

  // Handle mouse move for dragging
  useEffect(() => {
    if (!dragState.active) return

    const handleMouseMove = (e: MouseEvent) => {
      onDragMove({ x: e.clientX, y: e.clientY })

      // Update the dragged event time
      const newTime = calculateDraggedTime(e.clientY)
      if (newTime) {
        setDraggedEventTime(newTime)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragMove({ x: e.touches[0].clientX, y: e.touches[0].clientY })

        // Update the dragged event time
        const newTime = calculateDraggedTime(e.touches[0].clientY)
        if (newTime) {
          setDraggedEventTime(newTime)
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRef.current || !dragState.event || !dragState.initialPosition || !dragState.currentPosition) return

      const rect = containerRef.current.getBoundingClientRect()

      // Calculate position
      const { dayIndex, timeOffset } = calculateDraggedPosition(e.clientX, e.clientY)

      // Snap to 15-minute intervals
      const hours = Math.floor(timeOffset)
      const minutes = Math.round(((timeOffset - hours) * 60) / 15) * 15

      // Create the new start time
      const newStart = new Date(dragState.event.start)

      // Apply day offset if in week view
      if (isWeekView && dayIndex !== null && dragState.initialPosition) {
        const initialDayIndex = Math.floor((dragState.initialPosition.x - rect.left) / (rect.width / 8))
        const dayOffset = dayIndex - initialDayIndex

        if (dayOffset !== 0) {
          newStart.setDate(newStart.getDate() + dayOffset)
        }
      }

      // Set the new hours and minutes
      newStart.setHours(hours)
      newStart.setMinutes(minutes)
      newStart.setSeconds(0)
      newStart.setMilliseconds(0)

      // Calculate new end time based on original duration
      const eventStart = new Date(dragState.event.start)
      const eventEnd = new Date(dragState.event.end)
      const duration = differenceInMinutes(eventEnd, eventStart)
      const newEnd = addMinutes(newStart, duration)

      // Reset dragged event time and drag offset
      setDraggedEventTime(null)
      setDragOffset(0)

      onDragEnd(newStart, newEnd)
    }

    const handleTouchEnd = handleMouseUp as any

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [dragState, onDragMove, onDragEnd, hourHeight, dragOffset, isWeekView])

  const handleEventDragStart = (event: CalendarEvent, e: React.MouseEvent | React.TouchEvent, top: number) => {
    if (!containerRef.current) return

    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculate the offset between the mouse position and the top of the event
    const rect = containerRef.current.getBoundingClientRect()
    const eventTop = top + rect.top
    setDragOffset(clientY - eventTop)

    onDragMove({ x: clientX, y: clientY })

    // Prevent default to avoid text selection during drag
    e.preventDefault()
  }

  return {
    dragOffset,
    setDragOffset,
    draggedEventTime,
    handleEventDragStart,
    calculateDraggedPosition,
  }
}

