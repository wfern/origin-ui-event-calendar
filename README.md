# Event Calendar React Component

A flexible, interactive calendar component built with [v0](https://v0.dev/) UI components. This calendar provides multiple view modes, drag-and-drop event management, and a clean, responsive interface.

## Features

- 📅 Multiple view modes: Month, Week, Day, and Agenda
- 🔄 Drag-and-drop event management
- 🎨 Event color customization
- 📱 Responsive design for all screen sizes
- 🌓 Dark mode support
- 🗓️ All-day events support
- 📍 Location support for events
- 🔄 Easy navigation between time periods

## Usage

```jsx
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar";

function App() {
  const [events, setEvents] = useState([]);

  const handleEventAdd = (event) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
  };

  const handleEventDelete = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="month"
    />
  );
}
```

## Props

| Prop            | Type                                     | Default   | Description                                |
| --------------- | ---------------------------------------- | --------- | ------------------------------------------ |
| `events`        | `CalendarEvent[]`                        | `[]`      | Array of events to display in the calendar |
| `onEventAdd`    | `(event: CalendarEvent) => void`         | -         | Callback function when an event is added   |
| `onEventUpdate` | `(event: CalendarEvent) => void`         | -         | Callback function when an event is updated |
| `onEventDelete` | `(eventId: string) => void`              | -         | Callback function when an event is deleted |
| `className`     | `string`                                 | -         | Additional CSS class for styling           |
| `initialView`   | `"month" \| "week" \| "day" \| "agenda"` | `"month"` | Initial view mode of the calendar          |

## Event Object Structure

```typescript
interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: "sky" | "amber" | "violet" | "rose" | "emerald" | "orange"
  location?: string
}
```

## View Modes

### Month View

Displays a traditional month calendar with events. Events that span multiple days are properly displayed across the days they span.

### Week View

Shows a detailed week view with hour slots. Events are positioned according to their time and can span multiple days.

### Day View

Provides a detailed view of a single day with hour slots. Perfect for seeing all events scheduled for a specific day.

### Agenda View

Lists all events in a chronological list format, making it easy to see upcoming events at a glance.

## Limitations and Known Issues

This calendar component is in early alpha stage and is not recommended for production use. There are several limitations and issues that need to be addressed:

### Drag and Drop Limitations

- In month view, only the first day of multi-day events is draggable
- In week and day views, multi-day events are placed in an "All day" section at the top of the view and are not draggable
- Some drag and drop operations may not update the event data correctly in certain edge cases

### Visual and UX Issues

- Limited responsiveness on very small screens
- Event overlapping is not handled optimally in some views
- Limited keyboard navigation support
- Accessibility features are incomplete

### Technical Limitations

- Limited testing across different browsers and devices
- Performance may degrade with a large number of events
- Time zone support is limited
- No recurring event support
- No integration with external calendars (Google, Outlook, etc.)

### Other Considerations

- The component has not undergone extensive testing
- Error handling is minimal
- Documentation is still evolving

We are actively working on improving these aspects and welcome contributions to address these limitations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
