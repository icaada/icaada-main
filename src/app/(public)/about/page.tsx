"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  communityActionModel,
  coreValues,
  frameworkPrinciples,
  impactAmbition,
  innovationAgenda,
  partnershipGroups,
  photos,
  strategicPriorities,
  sustainabilitySteps,
} from "@/data/content";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import { CredibilitySection } from "@/components/credibility";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About ICAADA"
        title="Mobilising communities. Empowering people. Building resilience."
        description="The Initiative for Community Action Against Drug Abuse is a community-focused platform dedicated to strengthening collective action against drug abuse across Northern Nigeria."
      />

      <section className="section-pad">
        <div className="container-wide two-col">
          <div className="prose-copy">
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="display">
              A structured platform for collective action.
            </h2>
            <p>
              ICAADA was established by The Coalition of Northern Groups (CNG)
              to provide a structured platform through which communities,
              government institutions, traditional and religious authorities,
              young people, civil society organisations, health professionals,
              researchers, development partners and the private sector can work
              together.
            </p>
            <p>
              We believe that the fight against drug abuse cannot be won through
              enforcement alone. Sustainable progress requires prevention,
              community ownership, youth empowerment, early intervention,
              appropriate treatment and referral, rehabilitation, reintegration,
              research and strategic partnerships.
            </p>
          </div>
          <div className="portrait-grid">
            <img
              src={photos.community}
              alt="Community members sharing a conversation outdoors"
            />
            <img
              src={photos.meeting}
              alt="People gathered around a table for a community discussion"
            />
          </div>
        </div>
      </section>

      <section
        className="section-pad"
        id="why-icaada"
        style={{ background: "hsl(var(--secondary))" }}
      >
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Why ICAADA?</Eyebrow>
              <h2 className="display">
                Drug abuse is not simply a law-enforcement issue.
              </h2>
            </div>
            <p>
              It is a complex community challenge affecting health, education,
              families, livelihoods, security and the future of young people.
            </p>
          </div>
          <div className="impact-grid about-impact">
            <div className="impact-stat">
              <strong>Health</strong>
              <span>
                Drug abuse has health consequences and requires appropriate
                support.
              </span>
            </div>
            <div className="impact-stat">
              <strong>Education</strong>
              <span>
                Prevention belongs in the places where young people learn and
                grow.
              </span>
            </div>
            <div className="impact-stat">
              <strong>Families</strong>
              <span>
                Families and trusted networks can be important sources of early
                support.
              </span>
            </div>
            <div className="impact-stat">
              <strong>Livelihoods</strong>
              <span>
                Community resilience includes the social and economic conditions
                around people.
              </span>
            </div>
            <div className="impact-stat">
              <strong>Security</strong>
              <span>
                Responsible cooperation should strengthen safety without turning
                communities into enforcement bodies.
              </span>
            </div>
            <div className="impact-stat">
              <strong>Young people</strong>
              <span>
                Youth-centred action creates protective opportunities and
                positive alternatives.
              </span>
            </div>
          </div>
          <div className="editorial-kicker about-response">
            <strong>
              Communities are often the first to observe the warning signs.
            </strong>
            <p>
              Families, teachers, traditional leaders, religious leaders and
              youth networks can play critical roles in prevention and early
              support. ICAADA exists to help transform this potential into
              organised, coordinated and measurable community action.
            </p>
          </div>
        </div>
      </section>

      <section className="principle-band section-pad">
        <div className="container-wide">
          <Eyebrow>Our principle</Eyebrow>
          <blockquote>
            “Prevention starts with the community, and sustainable solutions are
            built with the community.”
          </blockquote>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide two-col">
          <div className="prose-copy">
            <Eyebrow>Our vision</Eyebrow>
            <h2 className="display">
              A Northern Nigeria where communities are empowered, resilient and
              actively engaged.
            </h2>
            <p>
              We envision communities promoting healthy, productive and
              dignified lives while preventing drug abuse together.
            </p>
          </div>
          <div className="prose-copy">
            <Eyebrow>Our mission</Eyebrow>
            <h2 className="display">
              Mobilise, empower, strengthen and connect.
            </h2>
            <p>
              To mobilise communities, empower young people, strengthen
              prevention systems, facilitate access to appropriate support and
              recovery services, promote evidence-based interventions, and build
              strategic partnerships that reduce drug-related harm across
              Northern Nigeria.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad work-band" id="priorities">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our strategic priorities</Eyebrow>
              <h2 className="display">
                Seven connected ways to move from concern to action.
              </h2>
            </div>
            <p>
              Each priority supports a coordinated response rather than an
              isolated service.
            </p>
          </div>
          <div className="priority-detail-list">
            {strategicPriorities.map((priority) => (
              <article
                className={`priority-detail ${priority.featured ? "is-featured" : ""}`}
                id={priority.anchor}
                key={priority.title}
              >
                <div className="priority-detail-number">{priority.number}</div>
                <div>
                  <h3>{priority.title}</h3>
                  <p>{priority.description}</p>
                  <p className="priority-detail-note">{priority.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" id="action-model">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our Community Action Model</Eyebrow>
              <h2 className="display">A six-stage implementation model.</h2>
            </div>
            <p>
              ICAADA’s methodology understands context, tests practical action
              and builds toward long-term sustainability.
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
        </div>
      </section>

      <section className="section-pad work-band">
        <div className="container-wide program-feature flagship-feature">
          <img
            src={"https://res.cloudinary.com/dcvyjmflf/image/upload/v1788230615/WhatsApp_Image_2026-08-31_at_11.48.33_1.jpg"}
            alt="Hands joined during a group support session"
            loading="lazy"
          />
          <div className="program-copy">
            <Eyebrow>Envisioned flagship programme</Eyebrow>
            <h2 className="display">
              Northern Nigeria Drug Abuse Prevention and Community Action Summit
            </h2>
            <p>
              The Summit is envisioned as a major platform for bringing together
              key stakeholders to develop a shared regional response to drug
              abuse. It is designed not simply as a conference, but as a
              launchpad for sustained community action.
            </p>
            <div className="tag-list">
              {[
                "Policy dialogue",
                "Expert knowledge exchange",
                "Community mobilisation",
                "Youth engagement",
                "Partnership development",
                "Resource mobilisation",
                "Evidence and innovation",
                "Practical commitments",
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <Link
              href="/events/northern-nigeria-community-action-summit"
              className="link-arrow"
              data-testid="link-about-summit"
            >
              View the envisioned Summit <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad framework-band" id="framework">
        <div className="container-wide two-col">
          <div>
            <Eyebrow>Proposed framework · 2027–2032</Eyebrow>
            <h2 className="display">
              Northern Nigeria Community Action Framework 2027–2032
            </h2>
          </div>
          <div className="prose-copy">
            <p>
              ICAADA’s proposed Framework provides the strategic foundation for
              coordinated community-level action against drug abuse.
            </p>
            <div className="principle-grid">
              {frameworkPrinciples.map((principle, index) => (
                <div key={principle}>
                  <span>0{index + 1}</span>
                  <strong>{principle}</strong>
                </div>
              ))}
            </div>
            <p>
              Its implementation will progressively move from pilot communities
              to wider LGA and state-level adoption, guided by evidence,
              resources, local readiness and stakeholder commitment.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our innovation agenda</Eyebrow>
              <h2 className="display">
                Practical ideas for locally relevant prevention.
              </h2>
            </div>
            <p>
              ICAADA seeks to introduce innovations that help communities define
              action, learn and sustain progress.
            </p>
          </div>
          <div className="innovation-grid">
            {innovationAgenda.map((item, index) => (
              <article key={item.title}>
                <span className="work-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad work-band" id="partnerships">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our partnership philosophy</Eyebrow>
              <h2 className="display">
                Meaningful progress requires partnership rather than isolation.
              </h2>
            </div>
            <p>
              We seek shared objectives, clear responsibilities, measurable
              results, transparency and mutual accountability.
            </p>
          </div>
          <div className="ecosystem">
            {partnershipGroups.map((partner, index) => (
              <span key={partner} className={index < 3 ? "is-emphasis" : ""}>
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CredibilitySection />

      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our approach to sustainability</Eyebrow>
              <h2 className="display">
                Local systems that can continue beyond projects and funding
                cycles.
              </h2>
            </div>
            <p>
              We aim to develop community systems that can continue functioning
              beyond individual projects or funding cycles.
            </p>
          </div>
          <div className="sustainability-track">
            {sustainabilitySteps.map((step, index) => (
              <div key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
                {index < sustainabilitySteps.length - 1 && (
                  <ArrowRight size={16} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad work-band">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Our core values</Eyebrow>
              <h2 className="display">The commitments behind the work.</h2>
            </div>
          </div>
          <div className="value-list">
            {coreValues.map((value, index) => (
              <article key={value.title}>
                <span className="work-index">0{index + 1}</span>
                <div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" id="ambition">
        <div className="container-wide ambition-panel">
          <div>
            <Eyebrow>Our impact ambition · 2032</Eyebrow>
            <h2 className="display">
              A stronger prevention ecosystem in Northern Nigeria.
            </h2>
            <p>
              By 2032, ICAADA seeks to contribute to a Northern Nigerian
              prevention ecosystem in which:
            </p>
          </div>
          <ul>
            {impactAmbition.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta-block section-pad">
        <div className="container-wide cta-inner">
          <div>
            <Eyebrow>Join the movement</Eyebrow>
            <h2 className="display">
              Collective, coordinated and sustained action starts with a
              conversation.
            </h2>
          </div>
          <div>
            <p>
              Together, we can move from awareness to action and from isolated
              interventions to coordinated community systems.
            </p>
            <ButtonLink href="/get-involved" secondary testId="link-about-cta">
              Join the movement
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
