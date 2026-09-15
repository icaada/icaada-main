"use client";

import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  communityActionModel,
  frameworkPrinciples,
  news,
} from "@/data/content";
import { PageHero } from "@/components/site";
import Link from "next/link";

export default function News() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const categories = [
    "All",
    ...Array.from(new Set(news.map((item) => item.category))),
  ];
  const filtered = useMemo(
    () =>
      news.filter(
        (item) =>
          (filter === "All" || item.category === filter) &&
          `${item.title} ${item.excerpt}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query],
  );

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
          <div className="search-row">
            <Search
              size={19}
              style={{ marginTop: 14, color: "hsl(var(--muted-foreground))" }}
            />
            <input
              className="search-field"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search perspectives and learning"
              aria-label="Search news"
              data-testid="input-news-search"
            />
          </div>
          <div className="filter-row">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-button ${filter === category ? "active" : ""}`}
                onClick={() => setFilter(category)}
                data-testid={`button-news-filter-${category.toLowerCase().replaceAll(" ", "-")}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="listing-grid">
            {filtered.map((item) => (
              <Link
                href={`/news/${item.slug}`}
                className="listing-item focus-ring"
                key={item.slug}
                data-testid={`link-news-${item.slug}`}
              >
                <img src={item.image} alt="" loading="lazy" />
                <div className="card-meta">
                  <span>{item.category}</span>
                  <span>{item.date}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <span className="link-arrow">
                  {item.read} <ArrowUpRight size={15} />
                </span>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: "2rem 0" }} data-testid="text-news-empty">
              No entries match that search. Try a different phrase.
            </div>
          )}
        </div>
      </section>
    </>
  );
}


