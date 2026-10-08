import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { eventDateText, phaseLabel } from "@/lib/display";
import type { EventDto } from "@/Services/event.service";

export function EventCard({ event }: { event: EventDto }) {
  return (
    <div className="event-card">
      <div className="date-tile">
        <strong>{event.phase === "ENVISIONED" ? "●" : "○"}</strong>
        <span>{phaseLabel[event.phase]}</span>
      </div>
      <div>
        <div className="card-meta">
          <span>{event.type}</span>
          <span>
            <MapPin size={12} /> {event.location}
          </span>
          <span>{eventDateText(event)}</span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <Link
          href={`/events/${event.slug}`}
          className="link-arrow"
          data-testid={`link-event-${event.slug}`}
        >
          View event <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
