"use client";

import { ArrowRight } from "lucide-react";
import {
  communityActionModel,
  photos,
  strategicPriorities,
} from "@/data/content";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";
import Image from "next/image";

export default function OurWork() {
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Community-led action for prevention, resilience and appropriate support."
        description="ICAADA organises its work around seven strategic priorities that connect communities, young people, trusted institutions, evidence and partnerships across Northern Nigeria."
      />

      <section className="section-pad">
        <div className="container-wide">
          <div className="editorial-grid">
            <div className="editorial-kicker">
              <Eyebrow>Our role</Eyebrow>
              <strong>One challenge. A connected response.</strong>
              <p>
                Drug abuse affects health, education, families, livelihoods,
                security and the future of young people. No single institution
                or intervention can address those dimensions alone.
              </p>
            </div>
            <div className="prose-copy">
              <h2 className="display">
                Prevention + community ownership + youth empowerment.
              </h2>
              <p>
                ICAADA brings together early intervention, appropriate support,
                recovery, research and strategic partnerships so communities can
                move from concern to practical and sustainable action.
              </p>
              <p>
                Where clinical or statutory services are required, ICAADA’s role
                is to strengthen awareness, referral and connection. ICAADA does
                not replace qualified clinical or statutory services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad work-band">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Strategic priorities</Eyebrow>
              <h2 className="display">Where we focus.</h2>
            </div>
            <p>
              Each priority is part of the same community prevention ecosystem.
            </p>
          </div>
          <div className="work-priority-list">
            {strategicPriorities.map((priority, index) => (
              <article
                className={`work-priority ${priority.featured ? "is-featured" : ""}`}
                id={priority.anchor}
                key={priority.title}
              >
                <div className="work-priority-image">
                  <Image width={470} height={400} src={priority.image} alt="" loading="lazy" />
                </div>
                <div className="work-priority-copy">
                  <span className="work-index">{priority.number} / 07</span>
                  <h2>{priority.title}</h2>
                  <p className="work-priority-lead">{priority.description}</p>
                  <p>{priority.detail}</p>
                  {index < strategicPriorities.length - 1 && (
                    <span className="work-next">
                      Next: {strategicPriorities[index + 1].title}{" "}
                      <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>How the work moves</Eyebrow>
              <h2 className="display">
                Map. Mobilise. Pilot. Measure. Scale. Institutionalise.
              </h2>
            </div>
            <p>
              The Community Action Model turns strategic priorities into an
              intentional implementation journey.
            </p>
          </div>
          <div className="process-track compact">
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

      <section className="section-pad">
        <div className="container-wide program-feature">
          <Image
            src={photos.meeting}
            alt="People taking part in a stakeholder meeting"
            loading="lazy"
            width={540}
            height={400}
          />
          <div className="program-copy">
            <Eyebrow>Work with ICAADA</Eyebrow>
            <h2 className="display">
              Bring a community, a question, evidence or institutional
              commitment.
            </h2>
            <p>
              ICAADA welcomes collaboration built on shared objectives, clear
              responsibilities, measurable results, transparency and mutual
              accountability.
            </p>
            <ButtonLink
              href="/get-involved"
              secondary
              testId="link-work-partnership"
            >
              Explore partnership pathways
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
