"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import { useState } from "react";
import { events } from "@/data/content";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import Link from "next/link";

function EventCard({ event }: { event: (typeof events)[number] }) {
  return (
    <div className="event-card">
      <div className="date-tile">
        <strong>{event.status === "Envisioned" ? "●" : "○"}</strong>
        <span>{event.status}</span>
      </div>
      <div>
        <div className="card-meta">
          <span>{event.type}</span>
          <span>
            <MapPin size={12} /> {event.location}
          </span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <Link
          href={`/events/${event.slug}`}
          className="link-arrow"
          data-testid={`link-event-${event.slug}`}
        >
          View event concept <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function Events() {
  const [filter, setFilter] = useState("All");
  const types = ["All", "Upcoming", "Ongoing", "Past", "Envisioned"];
  const filtered =
    filter === "All"
      ? events
      : events.filter((event) => event.status === filter);

  return (
    <>
      <PageHero
        eyebrow="Events & convening"
        title="Rooms for shared action."
        description="The event experience supports upcoming, ongoing and past states while the source document’s flagship Summit is presented accurately as an envisioned programme."
      />
      <section className="section-pad">
        <div className="container-wide">
          <div className="content-note">
            <strong>Content status</strong>
            <p>
              The Summit is source-backed and envisioned. Upcoming, ongoing and
              past entries are explicitly labelled illustrative UI examples, not
              completed ICAADA activities.
            </p>
          </div>
          <div className="filter-row" role="group" aria-label="Filter events">
            {types.map((type) => (
              <button
                key={type}
                className={`filter-button ${filter === type ? "active" : ""}`}
                onClick={() => setFilter(type)}
                data-testid={`button-event-filter-${type.toLowerCase()}`}
              >
                {type}
              </button>
            ))}
          </div>
          <div style={{ maxWidth: "900px" }}>
            {filtered.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </div>
      </section>
      <section
        className="section-pad"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <div className="container-wide two-col">
          <div>
            <Eyebrow>Convening with purpose</Eyebrow>
            <h2 className="display">
              Policy dialogue, community mobilisation and practical commitments.
            </h2>
          </div>
          <div className="prose-copy">
            <p>
              ICAADA’s envisioned flagship convening brings policy dialogue,
              expert knowledge exchange, youth engagement, partnership
              development, resource mobilisation, evidence and innovation into
              one regional platform.
            </p>
            <ButtonLink href="/contact" testId="link-events-interest">
              Register partnership interest
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
