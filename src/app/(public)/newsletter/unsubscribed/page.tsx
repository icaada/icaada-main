import type { Metadata } from "next";
import { ButtonLink, PageHero } from "@/components/site";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

export default async function Unsubscribed({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ok = (await searchParams).status === "ok";
  return (
    <>
      <PageHero
        eyebrow="The ICAADA brief"
        title={ok ? "You've been unsubscribed." : "That link didn't work."}
        description={
          ok
            ? "You won't receive the ICAADA brief any more. You can subscribe again at any time from the footer of any page."
            : "The unsubscribe link is invalid or incomplete. Try the link from your latest email again, or contact us and we'll remove you."
        }
      />
      <section className="section-pad">
        <div className="container-wide">
          <ButtonLink href={ok ? "/" : "/contact"} secondary testId="link-unsubscribed-next">
            {ok ? "Back to the homepage" : "Contact ICAADA"}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
