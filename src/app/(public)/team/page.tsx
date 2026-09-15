"use client";

import { PageHero } from "@/components/site";
import { teamMembers } from "@/data/content";
import { TeamGrid } from "@/components/team";

export default function Team() {
  return (
    <>
      <PageHero
        eyebrow="Our People"
        title="Meet the Team"
        description="Meet the people working together to advance ICAADA's mission of community action, prevention, advocacy and healthier, more resilient communities."
      />
      <section className="section-pad">
        <div className="container-wide">
          {/* <div className="content-note team-directory-note">
            <strong>Placeholder directory</strong>
            <p>
              The source material does not identify real ICAADA staff. Names,
              roles, biographies and images below are replaceable mock content
              and must be verified before publication.
            </p>
          </div> */}
          <TeamGrid members={teamMembers} />
        </div>
      </section>
    </>
  );
}
