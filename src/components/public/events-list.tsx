"use client";

import { useState } from "react";
import { EventCard } from "@/components/public/event-card";
import { phaseLabel } from "@/lib/display";
import type { EventDto } from "@/Services/event.service";

const filters: ("All" | EventDto["phase"])[] = ["All", "UPCOMING", "ONGOING", "PAST", "ENVISIONED"];

export function EventsList({ events }: { events: EventDto[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const filtered = filter === "All" ? events : events.filter((event) => event.phase === filter);

  return (
    <>
      <div className="filter-row" role="group" aria-label="Filter events">
        {filters.map((type) => {
          const label = type === "All" ? "All" : phaseLabel[type];
          return (
            <button
              key={type}
              className={`filter-button ${filter === type ? "active" : ""}`}
              onClick={() => setFilter(type)}
              aria-pressed={filter === type}
              data-testid={`button-event-filter-${label.toLowerCase()}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ maxWidth: "900px" }}>
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {filtered.length === 0 && (
          <p data-testid="text-events-empty">No {filter === "All" ? "" : `${phaseLabel[filter].toLowerCase()} `}events right now.</p>
        )}
      </div>
    </>
  );
}
