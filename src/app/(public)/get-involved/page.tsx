"use client";

import {
  BookOpen,
  Building2,
  HeartHandshake,
  Landmark,
  Search,
  Users,
} from "lucide-react";
import { ButtonLink, Eyebrow, PageHero } from "@/components/site";

const paths = [
  {
    icon: <HeartHandshake size={25} />,
    title: "Communities",
    text: "Take part in locally led prevention and resilience-building.",
    label: "Start a community conversation",
  },
  {
    icon: <Users size={25} />,
    title: "Young People",
    text: "Become prevention champions and community leaders.",
    label: "Explore youth participation",
  },
  {
    icon: <Landmark size={25} />,
    title: "Government & Institutions",
    text: "Collaborate on coordinated community action within clear mandates.",
    label: "Discuss institutional partnership",
  },
  {
    icon: <Search size={25} />,
    title: "Researchers",
    text: "Contribute evidence, knowledge, assessment and learning.",
    label: "Share research interest",
  },
  {
    icon: <Building2 size={25} />,
    title: "Development & Private-Sector Partners",
    text: "Support sustainable programmes, practical innovation and shared learning.",
    label: "Explore strategic partnership",
  },
  {
    icon: <BookOpen size={25} />,
    title: "Individuals",
    text: "Volunteer, advocate and support the movement for healthier communities.",
    label: "Tell us how you want to help",
  },
];

export default function GetInvolved() {
  return (
    <>
      <PageHero
        eyebrow="Join the movement"
        title="Collective. Coordinated. Sustained."
        description="The scale and complexity of drug abuse require a response that brings communities, institutions, young people, researchers, partners and individuals into shared action."
      />
      <section className="section-pad">
        <div className="container-wide">
          <div className="section-heading">
            <div>
              <Eyebrow>Find your place in the movement</Eyebrow>
              <h2 className="display">
                Different roles. Shared responsibility.
              </h2>
            </div>
            <p>
              You do not need to approach the challenge alone. Bring your
              community knowledge, mandate, evidence, platform, resources or
              willingness to participate.
            </p>
          </div>
          <div className="involvement-grid">
            {paths.map((path, index) => (
              <article
                className={`involvement-path ${index === 0 || index === 1 ? "is-featured" : ""}`}
                key={path.title}
              >
                <span className="involvement-icon">{path.icon}</span>
                <span className="work-index">0{index + 1}</span>
                <h3>{path.title}</h3>
                <p>{path.text}</p>
                <ButtonLink
                  href="/contact"
                  secondary
                  testId={`link-involved-${path.title.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`}
                >
                  {path.label}
                </ButtonLink>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad work-band">
        <div className="container-wide two-col">
          <div>
            <Eyebrow>Partnership principles</Eyebrow>
            <h2 className="display">
              Shared objectives. Clear responsibilities. Measurable results.
            </h2>
          </div>
          <div className="prose-copy">
            <p>
              ICAADA seeks partnerships built on transparency and mutual
              accountability. Sustainable progress depends on communities and
              institutions knowing the role they can responsibly play.
            </p>
            <ButtonLink
              href="/about#partnerships"
              testId="link-involved-ecosystem"
            >
              See the partnership ecosystem
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="cta-block section-pad">
        <div className="container-wide cta-inner">
          <div>
            <Eyebrow>Together, we can</Eyebrow>
            <h2 className="display">
              Move from awareness to action and short-term responses to
              sustainable solutions.
            </h2>
          </div>
          <div>
            <p>
              Start a conversation about how you or your organisation can
              contribute.
            </p>
            <ButtonLink
              href="/contact"
              secondary
              testId="link-involved-partner"
            >
              Partner with ICAADA
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
