"use client"

import { useState, useEffect } from "react"
import { format, isAfter, isBefore } from "date-fns"
import type { CalendarEvent, EventColor } from "@/components/calendar/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CalendarIcon, Trash2Icon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
}

export function EventDialog({ event, isOpen, onClose, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState<EventColor>("sky")
  const [error, setError] = useState<string | null>(null)

  // Debug log to check what event is being passed
  useEffect(() => {
    console.log("EventDialog received event:", event)
  }, [event])

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")

      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartDate(start)
      setEndDate(end)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(end))
      setAllDay(event.allDay || false)
      setLocation(event.location || "")
      setColor((event.color as EventColor) || "sky")
      setError(null) // Reset error when opening dialog
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate(new Date())
    setEndDate(new Date())
    setStartTime("09:00")
    setEndTime("10:00")
    setAllDay(false)
    setLocation("")
    setColor("sky")
    setError(null)
  }

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        const label = format(new Date().setHours(hour, minute), "h:mm a")
        options.push({ value, label })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const handleSave = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!allDay) {
      const [startHours, startMinutes] = startTime.split(":").map(Number)
      const [endHours, endMinutes] = endTime.split(":").map(Number)

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date")
      return
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)"

    onSave({
      id: event?.id || "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
    })
  }

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id)
    }
  }

  // Updated color options to match types.ts
  const colorOptions: Array<{ value: EventColor; label: string; bgClass: string; borderClass: string }> = [
    { value: "sky", label: "Sky", bgClass: "bg-sky-100", borderClass: "border-sky-200" },
    { value: "amber", label: "Amber", bgClass: "bg-amber-100", borderClass: "border-amber-200" },
    { value: "violet", label: "Violet", bgClass: "bg-violet-100", borderClass: "border-violet-200" },
    { value: "rose", label: "Rose", bgClass: "bg-rose-100", borderClass: "border-rose-200" },
    { value: "emerald", label: "Emerald", bgClass: "bg-emerald-100", borderClass: "border-emerald-200" },
    { value: "orange", label: "Orange", bgClass: "bg-orange-100", borderClass: "border-orange-200" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event?.id ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
            <Label htmlFor="all-day">All day</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <span className={cn("truncate", !startDate && "text-muted-foreground")}>
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <span className={cn("truncate", !startDate && "text-muted-foreground")}>
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon
                      size={16}
                      className="text-muted-foreground/80 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date)
                        setError(null) // Clear error when user changes the date
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!allDay && (
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
            />
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <RadioGroup value={color} onValueChange={(value: EventColor) => setColor(value)} className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <div key={colorOption.value} className="flex items-center space-x-2">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", colorOption.bgClass, colorOption.borderClass)}>
                    <RadioGroupItem
                      value={colorOption.value}
                      id={`color-${colorOption.value}`}
                    />
                  </div>
                  <Label htmlFor={`color-${colorOption.value}`} className="text-sm">
                    {colorOption.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {event?.id && (
            <Button variant="destructive" onClick={handleDelete} type="button">
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
