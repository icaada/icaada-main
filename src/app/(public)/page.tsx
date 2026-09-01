"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import {
  communityActionModel,
  events,
  photos,
  strategicPriorities,
} from "@/data/content";
import { ButtonLink, Eyebrow, HeroCarousel } from "@/components/site";
import { FeaturedVideo, VoiceCarousel } from "@/components/credibility";
import Image from "next/image";

export default function Home() {
  const summit = events[0];

  return (
    <>
      <HeroCarousel />

      <section className="impact-strip">
        <div className="container-wide impact-grid">
          <div className="impact-lead">
            <Eyebrow>Why ICAADA?</Eyebrow>
            <p>
              Drug abuse is a community challenge affecting health, education,
              families, livelihoods, security and the future of young people.
            </p>
          </div>
          <div className="impact-stat">
            <strong>Health</strong>
            <span>
              Prevention and appropriate support protect healthy, dignified
              lives.
            </span>
          </div>
          <div className="impact-stat">
            <strong>Education</strong>
            <span>
              Schools and learning spaces are important places for early
              support.
            </span>
          </div>
          <div className="impact-stat">
            <strong>Community</strong>
            <span>
              Families, leaders and youth networks can turn warning signs into
              early action.
            </span>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>The challenge and the response</Eyebrow>
              <h2 className="display">Drug abuse is a community challenge.</h2>
            </div>
            <p>
              Communities are often the first to observe warning signs. ICAADA
              helps transform that potential into organised, coordinated and
              measurable community action.
            </p>
          </div>
          <div className="editorial-grid">
            <div className="editorial-kicker">
              <strong>Prevention starts with the community.</strong>
              <p>
                Families, teachers, traditional leaders, religious leaders and
                youth networks can play critical roles in prevention and early
                support.
              </p>
              <ButtonLink
                href="/about#why-icaada"
                secondary
                testId="link-home-why-icaada"
              >
                Why ICAADA
              </ButtonLink>
            </div>
            <div className="challenge-panel">
              <Image
                width={630}
                height={470}
                src={photos.community}
                alt="Community members sharing a conversation outdoors"
                loading="lazy"
              />
              <div className="challenge-copy">
                <span>Community → action → hope</span>
                <p>
                  Sustainable solutions are built with the community, not simply
                  delivered to it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="work-band section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our approach</Eyebrow>
              <h2 className="display">A six-stage Community Action Model.</h2>
            </div>
            <p>
              ICAADA’s methodology moves beyond one-off awareness campaigns
              toward practical, locally appropriate and sustainable systems.
            </p>
          </div>
          <div className="process-track">
            {communityActionModel.map((stage, index) => (
              <div className="process-stage" key={stage.title}>
                <div className="process-marker">
                  <span>{stage.number}</span>
                  {index < communityActionModel.length - 1 && <i />}
                </div>
                <div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
          <ButtonLink
            href="/about#action-model"
            secondary
            testId="link-home-action-model"
          >
            Explore the model
          </ButtonLink>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Where we focus</Eyebrow>
              <h2 className="display">
                Seven priorities. One connected response.
              </h2>
            </div>
            <p>
              Our strategic priorities connect prevention, resilience, support,
              evidence, safety and partnership across Northern Nigeria.
            </p>
          </div>
          <div className="priority-feature">
            <Image
              width={680}
              height={510}
              src={strategicPriorities[0].image}
              alt="Community members gathered together"
              loading="lazy"
            />
            <div>
              <span className="work-index">
                {strategicPriorities[0].number} / PRIORITY
              </span>
              <h3>{strategicPriorities[0].title}</h3>
              <p>{strategicPriorities[0].description}</p>
              <ButtonLink
                href="/our-work#community-prevention"
                secondary
                testId="link-home-community-prevention"
              >
                Explore community prevention
              </ButtonLink>
            </div>
          </div>
          <div className="priority-grid">
            {strategicPriorities.slice(1, 7).map((priority) => (
              <Link
                href={`/our-work#${priority.anchor}`}
                className="priority-item focus-ring"
                key={priority.title}
              >
                <span className="work-index">{priority.number}</span>
                <h3>{priority.title}</h3>
                <p>{priority.short}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <VoiceCarousel />
      <FeaturedVideo />

      <section
        className="section-pad"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Envisioned flagship programme</Eyebrow>
              <h2 className="display">
                A regional platform for sustained community action.
              </h2>
            </div>
            <ButtonLink
              href={`/events/${summit.slug}`}
              secondary
              testId="link-home-summit"
            >
              Explore the Summit
            </ButtonLink>
          </div>
          <div className="event-card flagship-event">
            <div className="date-tile">
              <strong>●</strong>
              <span>{summit.status}</span>
            </div>
            <div>
              <div className="card-meta">
                <span>{summit.type}</span>
                <span>
                  <MapPin size={12} /> {summit.location}
                </span>
              </div>
              <h3>{summit.title}</h3>
              <p>{summit.description}</p>
              <Link
                href={`/events/${summit.slug}`}
                className="link-arrow"
                data-testid="link-home-event-summit"
              >
                View the envisioned programme <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-block section-pad">
        <div className="container-wide cta-inner">
          <div>
            <Eyebrow>Join the movement</Eyebrow>
            <h2 className="display">
              From awareness to action. From projects to lasting systems.
            </h2>
          </div>
          <div>
            <p>
              The scale and complexity of drug abuse require a response that is
              collective, coordinated and sustained.
            </p>
            <ButtonLink href="/get-involved" secondary testId="link-home-cta">
              Get involved with ICAADA
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
