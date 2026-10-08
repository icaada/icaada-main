"use client";

import { ArrowUpRight, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { NewsPostDto } from "@/Services/news.service";

export function NewsList({ news }: { news: NewsPostDto[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...Array.from(new Set(news.map((item) => item.category)))];
  const q = query.toLowerCase();
  const filtered = news.filter(
    (item) =>
      (filter === "All" || item.category === filter) &&
      `${item.title} ${item.excerpt}`.toLowerCase().includes(q),
  );

  return (
    <>
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
            aria-pressed={filter === category}
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
            key={item.id}
            data-testid={`link-news-${item.slug}`}
          >
            {item.imageUrl && <Image width={470} height={400} src={item.imageUrl} alt="" loading="lazy" />}
            <div className="card-meta">
              <span>{item.category}</span>
              {item.dateLabel && <span>{item.dateLabel}</span>}
            </div>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
            <span className="link-arrow">
              {item.readLabel ?? "Read more"} <ArrowUpRight size={15} />
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ padding: "2rem 0" }} data-testid="text-news-empty">
          No entries match that search. Try a different phrase.
        </div>
      )}
    </>
  );
}
