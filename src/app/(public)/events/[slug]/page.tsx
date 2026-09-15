"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import {
  events,
  frameworkPrinciples,
  photos,
  stakeholderVoices,
} from "@/data/content";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import { VoiceCarousel } from "@/components/credibility";
import Link from "next/link";
import Image from "next/image";

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const event = events.find((item) => item.slug === slug) ?? events[0];
  const isSummit = event.status === "Envisioned";

  return (
    <>
      <PageHero
        eyebrow={`${event.status} ${event.type} / ${event.dateLabel}`}
        title={event.title}
        description={event.description}
      />
      <section className="section-pad">
        <div className="container-wide detail-layout">
          <div className="detail-main">
            <Image
              src={isSummit ? photos.meeting : photos.workshop}
              alt="People gathered around a table during a facilitated conversation"
              width={850}
              height={460}
            />
            <div className="prose-copy">
              <h2 className="display">
                {isSummit
                  ? "A launchpad for sustained community action."
                  : "An illustrative event experience."}
              </h2>
              {isSummit ? (
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
                {event.status === "Past"
                  ? "Ask about related learning"
                  : "Register your interest"}
              </ButtonLink>
            </div>
          </div>
          <aside className="detail-aside">
            <h3>Event status</h3>
            <ul className="aside-list">
              <li>
                <strong>{event.status}</strong>
              </li>
              <li>{event.contentStatus}</li>
              <li>
                <MapPin size={15} /> {event.location}
              </li>
              <li>{event.dateLabel}</li>
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
      {isSummit && (
        <VoiceCarousel
          voices={stakeholderVoices.filter(
            (voice) => voice.eventSlug === event.slug,
          )}
        />
      )}
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