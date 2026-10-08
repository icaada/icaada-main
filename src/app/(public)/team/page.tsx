import type { Metadata } from "next";
import { PageHero } from "@/components/site";
import { TeamGrid } from "@/components/team";
import { teamMemberService } from "@/Services/team-member.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our team",
  description: "Meet the people working together to advance ICAADA's mission of community action against drug abuse.",
};

export default async function Team() {
  const members = await teamMemberService.listPublished();
  return (
    <>
      <PageHero
        eyebrow="Our People"
        title="Meet the Team"
        description="Meet the people working together to advance ICAADA's mission of community action, prevention, advocacy and healthier, more resilient communities."
      />
      <section className="section-pad">
        <div className="container-wide">
          <TeamGrid members={members} />
        </div>
      </section>
    </>
  );
}
