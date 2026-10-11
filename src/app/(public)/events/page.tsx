import type { Metadata } from "next";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import { EventsList } from "@/components/public/events-list";
import { eventService } from "@/Services/event.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events",
  description: "ICAADA events and convenings: community dialogues, youth programmes, learning exchanges and the envisioned Northern Nigeria Community Action Summit.",
};

export default async function Events() {
  const events = await eventService.listPublished();

  return (
    <>
      <PageHero
        eyebrow="Events & convening"
        title="Rooms for shared action."
        description="Community dialogues, youth programmes and learning exchanges that bring families, young people, institutions and partners together around prevention."
      />
      <section className="section-pad">
        <div className="container-wide">
          <EventsList events={events} />
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
