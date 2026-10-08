import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Presentational building blocks shared by the public pages. No hooks here, so
// Server Components can import them; interactive pieces live in their own
// "use client" files (e.g. HeroCarousel.tsx).

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function ButtonLink({
  href,
  children,
  secondary = false,
  testId,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  testId: string;
}) {
  return (
    <Link
      href={href}
      className={`${secondary ? "button-secondary" : "button-primary"} focus-ring`}
      data-testid={testId}
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="container-wide reveal">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display" data-testid="text-page-title">
          {title}
        </h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

export function ImageCard({
  image,
  alt,
  children,
}: {
  image: string;
  alt: string;
  children: ReactNode;
}) {
  return (
    <div className="editorial-card relative">
      <Image src={image} alt={alt} loading="lazy" fill />
      {children}
    </div>
  );
}
