"use client"

import { useEventVisibility } from "@/hooks/use-event-visibility";

// Define event height as a constant
const EVENT_HEIGHT = 40; // pixels
const EVENT_GAP = 4; // pixels

const cells = [
  {
    id: 1,
    events: 10
  },
  {
    id: 2,
    events: 0
  },
  {
    id: 3,
    events: 1
  },
  {
    id: 4,
    events: 2
  },
  {
    id: 5,
    events: 0
  },
  {
    id: 6,
    events: 1
  }
];

export default function Home() {
  // Use our custom hook for event visibility
  const { 
    contentRef, 
    contentHeight, 
    getVisibleEventCount 
  } = useEventVisibility({
    eventHeight: EVENT_HEIGHT,
    eventGap: EVENT_GAP
  });

  return (
    <main 
      className="flex min-h-screen flex-col p-4 md:p-8"
      style={{ "--event-height": `${EVENT_HEIGHT}px`, "--event-gap": `${EVENT_GAP}px` } as React.CSSProperties}
    >
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      <div className="grid grid-cols-3 auto-rows-fr h-[50vh]">
        {cells.map((cell, index) => {
          // Calculate visibility directly in the render function
          const visibleCount = getVisibleEventCount(cell.events);
          const hasMore = cell.events > visibleCount;
          const remainingCount = cell.events - visibleCount;
          
          return (
            <div key={cell.id} className="border">
              <div className="p-1 h-full flex flex-col">
                <div className="text-lg font-semibold">Cell {cell.id}</div>
                <div 
                  className="flex-1 overflow-hidden"
                  ref={index === 0 ? contentRef : null}
                >
                  {/* Render events directly without creating intermediate arrays */}
                  {Array.from({ length: cell.events }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`bg-gray-200 h-[var(--event-height)] mt-[var(--event-gap)] ${i >= visibleCount && hasMore ? 'hidden' : ''}`}
                      aria-hidden={i >= visibleCount && hasMore ? 'true' : undefined}
                    ></div>
                  ))}
                  
                  {/* Show "more" button if needed */}
                  {hasMore && (
                    <div className="bg-blue-100 text-blue-800 h-[var(--event-height)] mt-[var(--event-gap)] flex items-center justify-center">
                      + {remainingCount} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {contentHeight && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold">Measurements</h2>
          <p>Content container height: {contentHeight}px</p>
          <p>Event height + gap: {EVENT_HEIGHT + EVENT_GAP}px</p>
          <p>Maximum whole events that can fit: {getVisibleEventCount(cells[0].events)}</p>
          <p><small>Using custom hook with optimized ResizeObserver</small></p>
        </div>
      )}
    </main>
  )
}
