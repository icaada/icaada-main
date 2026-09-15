"use client";

import { ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";
import {
  communityActionModel,
  frameworkPrinciples,
  news,
} from "@/data/content";
import { PageHero } from "@/components/site";
import Link from "next/link";



export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = news.find((article) => article.slug === slug) ?? news[0];

  return (
    <>
      <PageHero
        eyebrow={`${item.category} / ${item.date}`}
        title={item.title}
        description={item.excerpt}
      />
      <section className="section-pad">
        <div className="container-wide detail-layout">
          <article className="detail-main">
            <img src={item.image} alt="" />
            <div className="prose-copy">
              <p>{item.excerpt}</p>
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