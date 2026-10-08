import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { communityActionModel, frameworkPrinciples } from "@/data/content";
import { PageHero } from "@/components/site";
import Link from "next/link";
import Image from "next/image";
import { newsService } from "@/Services/news.service";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

/** Pre-render every published article; new slugs render on first request. */
export async function generateStaticParams() {
  return (await newsService.listPublished()).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await newsService.getPublishedBySlug((await params).slug);
  if (!item) return { title: "Article not found" };
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: { type: "article", ...(item.imageUrl ? { images: [item.imageUrl] } : {}) },
  };
}

export default async function NewsDetail({ params }: Props) {
  const item = await newsService.getPublishedBySlug((await params).slug);
  if (!item) notFound();
  const news = await newsService.listPublished();
  const paragraphs = item.body?.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) ?? [];

  return (
    <>
      <PageHero
        eyebrow={item.dateLabel ? `${item.category} / ${item.dateLabel}` : item.category}
        title={item.title}
        description={item.excerpt}
      />
      <section className="section-pad">
        <div className="container-wide detail-layout">
          <article className="detail-main">
            {item.imageUrl && <Image width={850} height={460} src={item.imageUrl} alt="" />}
            <div className="prose-copy">
              <p>{item.excerpt}</p>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
              <>
              <h2 className="display">Prevention starts with the community.</h2>
              <p>
                Drug abuse is a complex community challenge affecting health,
                education, families, livelihoods, security and the future of
                young people. Communities are often the first to observe warning
                signs, while families, teachers, traditional leaders, religious
                leaders and youth networks can play critical roles in prevention
                and early support.
              </p>
              <p>
                ICAADA exists to help transform this potential into organised,
                coordinated and measurable community action. Its approach
                combines prevention, community ownership, youth empowerment,
                early intervention, appropriate support and recovery, research
                and strategic partnerships.
              </p>
              {item.slug === "from-map-to-institutionalise" && (
                <div className="process-track article-process">
                  {communityActionModel.map((stage) => (
                    <div className="process-stage" key={stage.title}>
                      <div className="process-marker">
                        <span>{stage.number}</span>
                      </div>
                      <div>
                        <h3>{stage.title}</h3>
                        <p>{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {item.slug === "a-regional-framework-for-action" && (
                <div className="principle-grid">
                  {frameworkPrinciples.map((principle, index) => (
                    <div key={principle}>
                      <span>0{index + 1}</span>
                      <strong>{principle}</strong>
                    </div>
                  ))}
                </div>
              )}
              <p>
                <strong>Source note:</strong> This perspective is based on the
                About ICAADA organizational document and preserves the proposed,
                envisioned and ambition-based status of future initiatives.
              </p>
              </>
              )}
            </div>
          </article>
          <aside className="detail-aside">
            <h3>Keep reading</h3>
            <ul className="aside-list">
              {news
                .filter((article) => article.slug !== item.slug)
                .slice(0, 3)
                .map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/news/${article.slug}`}
                      data-testid={`link-related-${article.slug}`}
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
            </ul>
            <Link
              href="/news"
              className="link-arrow"
              data-testid="link-news-back"
            >
              All perspectives <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}