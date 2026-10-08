import type { Metadata } from "next";
import { PageHero } from "@/components/site";
import { NewsList } from "@/components/public/news-list";
import { newsService } from "@/Services/news.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "News & perspectives",
  description: "Perspectives and learning from ICAADA on prevention, youth resilience, the Community Action Model and coordinated community action.",
};

export default async function News() {
  const news = await newsService.listPublished();

  return (
    <>
      <PageHero
        eyebrow="Perspectives & learning"
        title="The ideas behind community action."
        description="Document-backed explainers on prevention, youth resilience, the Community Action Model and ICAADA’s proposed regional framework."
      />
      <section className="section-pad">
        <div className="container-wide">
          <div className="content-note">
            <strong>Editorial content</strong>
            <p>
              These entries interpret ICAADA’s source document. They do not
              claim completed programmes, published research or existing
              achievements.
            </p>
          </div>
          <NewsList news={news} />
        </div>
      </section>
    </>
  );
}
