import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { frameworkPrinciples, photos } from "@/data/content";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import { VoiceCarousel } from "@/components/credibility";
import Link from "next/link";
import Image from "next/image";
import { eventDateText, phaseLabel } from "@/lib/display";
import { eventService } from "@/Services/event.service";
import { voiceService } from "@/Services/voice.service";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

/** Pre-render every published event; new slugs render on first request. */
export async function generateStaticParams() {
  return (await eventService.listPublished()).map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await eventService.getPublishedBySlug((await params).slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description,
    openGraph: event.imageUrl ? { images: [event.imageUrl] } : undefined,
  };
}

export default async function EventDetail({ params }: Props) {
  const event = await eventService.getPublishedBySlug((await params).slug);
  if (!event) notFound();
  const voices = (await voiceService.listPublished()).filter((voice) => voice.eventId === event.id);
  const isSummit = event.phase === "ENVISIONED";
  const status = phaseLabel[event.phase];
  const paragraphs = event.body?.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) ?? [];

  return (
    <>
      <PageHero
        eyebrow={`${status} ${event.type} / ${eventDateText(event)}`}
        title={event.title}
        description={event.description}
      />
      <section className="section-pad">
        <div className="container-wide detail-layout">
          <div className="detail-main">
            <Image
              src={event.imageUrl ?? (isSummit ? photos.meeting : photos.workshop)}
              alt="People gathered around a table during a facilitated conversation"
              width={850}
              height={460}
            />
            <div className="prose-copy">
              <h2 className="display">
                {paragraphs.length
                  ? "About this event."
                  : isSummit
                    ? "A launchpad for sustained community action."
                    : "An illustrative event experience."}
              </h2>
              {paragraphs.length ? (
                paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : isSummit ? (
                <>
                  <p>
                    The Summit will provide an opportunity for policy dialogue,
                    expert knowledge exchange, community mobilisation, youth
                    engagement, partnership development, resource mobilisation,
                    presentation of evidence and innovations, and development of
                    practical commitments.
                  </p>
                  <p>
                    It is envisioned as a platform for launching the proposed
                    Northern Nigeria Community Action Framework on Drug Abuse
                    Prevention.
                  </p>
                  <div className="principle-grid">
                    {frameworkPrinciples.map((principle, index) => (
                      <div key={principle}>
                        <span>0{index + 1}</span>
                        <strong>{principle}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  This static example demonstrates how ICAADA’s event interface
                  can support event information without claiming that the
                  activity has taken place.
                </p>
              )}
              <ButtonLink href="/contact" testId="link-event-detail-interest">
                {event.phase === "PAST"
                  ? "Ask about related learning"
                  : "Register your interest"}
              </ButtonLink>
            </div>
          </div>
          <aside className="detail-aside">
            <h3>Event status</h3>
            <ul className="aside-list">
              <li>
                <strong>{status}</strong>
              </li>
              {event.contentNote && <li>{event.contentNote}</li>}
              <li>
                <MapPin size={15} /> {event.location}
              </li>
              <li>{eventDateText(event)}</li>
            </ul>
            <Link
              href="/events"
              className="link-arrow"
              data-testid="link-event-back"
            >
              All events <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </section>
      <section className="section-pad work-band">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Speakers & participants</Eyebrow>
              <h2 className="display">A multi-stakeholder room.</h2>
            </div>
            <p>
              Representative participant groups are shown for UI demonstration;
              no individual speakers are claimed or announced.
            </p>
          </div>
          <div className="ecosystem">
            {[
              "Community leaders",
              "Young people",
              "Government institutions",
              "Traditional authorities",
              "Religious authorities",
              "Health professionals",
              "Researchers",
              "Civil society organisations",
              "Development partners",
              "Private sector",
            ].map((participant) => (
              <span key={participant}>{participant}</span>
            ))}
          </div>
        </div>
      </section>
      {voices.length > 0 && <VoiceCarousel voices={voices} />}
      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Event gallery</Eyebrow>
              <h2 className="display">A space for the visual record.</h2>
            </div>
            <p>
              These photographs are layout placeholders, not a gallery from this
              event.
            </p>
          </div>
          <div className="event-gallery">
            <Image
              src={photos.community}
              alt="Illustrative community gathering"
              width={540}
              height={400}
            />
            <Image width={330} height={300} src={photos.youth} alt="Illustrative youth gathering" />
            <Image width={330} height={300} src={photos.workshop} alt="Illustrative workshop setting" />
          </div>
        </div>
      </section>
      <section className="section-pad work-band">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Related media</Eyebrow>
              <h2 className="display">Continue the learning.</h2>
            </div>
            <p>
              Static placeholders show where publications, press, video and
              event resources can appear.
            </p>
          </div>
          <div className="related-media-grid">
            {[
              "Community Action Model briefing",
              "Youth resilience video concept",
              "Proposed 2027–2032 Framework overview",
            ].map((item, index) => (
              <article key={item}>
                <span className="work-index">0{index + 1}</span>
                <h3>{item}</h3>
                <p>Media placeholder · content to be published by ICAADA.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}