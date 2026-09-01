import { type ReactNode, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { heroSlides } from "@/data/content";
import Link from "next/link";
import Image from "next/image";



export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["About", "/about"],
    ["Our work", "/our-work"],
    ["Team", "/team"],
    ["Events", "/events"],
    ["Media", "/media"],
    ["News", "/news"],
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="site-shell">
      <div className="topbar">
        <div className="container-wide topbar-inner">
          <span data-testid="text-topbar-message">
            Mobilising communities. Empowering people. Building resilience
            across Northern Nigeria.
          </span>
          <Link href="/contact" data-testid="link-topbar-contact">
            Talk to our team <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
      <header className="main-header">
        <div className="container-wide nav-inner">
          <Link href="/" className="brand focus-ring" data-testid="link-brand">
            <span className="brand-mark" aria-hidden="true">
              IC
            </span>
            <span className="brand-wordmark">
              ICAADA
              <small>Initiative for Community Action Against Drug Abuse</small>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                data-testid={`link-nav-${label.toLowerCase().replace(" ", "-")}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/get-involved"
            className="nav-cta"
            data-testid="link-nav-get-involved"
          >
            Get involved <ArrowUpRight size={14} />
          </Link>
          <button
            className="menu-toggle focus-ring"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-panel" aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                data-testid={`link-mobile-${label.toLowerCase().replace(" ", "-")}`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/get-involved"
              className="nav-cta"
              onClick={() => setMenuOpen(false)}
              data-testid="link-mobile-get-involved"
            >
              Get involved <ArrowUpRight size={14} />
            </Link>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-wide footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark">IC</span>
            <span className="brand-wordmark">
              ICAADA
              <small>Initiative for Community Action Against Drug Abuse</small>
            </span>
          </div>
          <p>
            A community-focused platform strengthening collective action against
            drug abuse and building resilient communities across Northern
            Nigeria.
          </p>
          <div style={{ display: "flex", gap: ".8rem", marginTop: "1.2rem" }}>
            <a
              href="https://www.instagram.com"
              aria-label="ICAADA on Instagram"
              data-testid="link-footer-instagram"
            >
              <Instagram size={17} />
            </a>
            <a
              href="https://www.linkedin.com"
              aria-label="ICAADA on LinkedIn"
              data-testid="link-footer-linkedin"
            >
              <Linkedin size={17} />
            </a>
            <a
              href="https://www.facebook.com"
              aria-label="ICAADA on Facebook"
              data-testid="link-footer-facebook"
            >
              <Facebook size={17} />
            </a>
          </div>
        </div>
        <div>
          <div className="footer-title">Explore</div>
          <div className="footer-links">
            {[
              ["About", "/about"],
              ["Our work", "/our-work"],
              ["Our team", "/team"],
              ["Events", "/events"],
              ["News & insights", "/news"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                data-testid={`link-footer-${label.toLowerCase().replaceAll(" ", "-")}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-title">Connect</div>
          <div className="footer-links">
            <Link href="/get-involved" data-testid="link-footer-volunteer">
              Join the movement
            </Link>
            <Link href="/get-involved" data-testid="link-footer-partner">
              Partner with ICAADA
            </Link>
            <Link href="/contact" data-testid="link-footer-contact">
              Contact ICAADA
            </Link>
          </div>
        </div>
        <div className="newsletter">
          <div className="footer-title">ICAADA updates</div>
          <p>
            Community action, prevention learning and opportunities to
            participate.
          </p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Your email address"
              data-testid="input-newsletter-email"
            />
            <button type="button" data-testid="button-newsletter-submit">
              Coming soon
            </button>
          </div>
        </div>
      </div>
      <div className="container-wide footer-bottom">
        <span>ICAADA · Initiative for Community Action Against Drug Abuse</span>
        <span>Community ownership. Prevention first. Sustainable action.</span>
      </div>
    </footer>
  );
}

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

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const isPaused = userPaused || isHovered || isFocused || isReducedMotion;
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setIsReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const moveSlide = (direction: number) => {
    setActiveSlide(
      (current) =>
        (current + direction + heroSlides.length) % heroSlides.length,
    );
  };

  return (
    <section
      className={`hero-carousel ${isPaused ? "is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="ICAADA mission stories"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") moveSlide(-1);
        if (event.key === "ArrowRight") moveSlide(1);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setIsFocused(false);
      }}
    >
      <div className="hero-slides" aria-live={isPaused ? "polite" : "off"}>
        {heroSlides.map((item, index) => (
          <div
            className={`hero-slide ${index === activeSlide ? "is-active" : ""}`}
            key={item.title}
            aria-hidden={index !== activeSlide}
          >
            <Image src={item.image} alt={item.alt} fill className="object-contain object-top"/>
          </div>
        ))}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="container-wide hero-carousel-content">
        <div className="hero-copy reveal" key={slide.title}>
          <Eyebrow>{slide.eyebrow}</Eyebrow>
          <h1 className="display">{slide.title}</h1>
          <p className="hero-intro">{slide.description}</p>
          <div className="hero-actions">
            <ButtonLink href={slide.primary.href} testId="link-hero-primary">
              {slide.primary.label}
            </ButtonLink>
            <ButtonLink
              href={slide.secondary.href}
              secondary
              testId="link-hero-secondary"
            >
              {slide.secondary.label}
            </ButtonLink>
          </div>
          <div className="hero-location">
            <MapPin size={14} /> {slide.location}
          </div>
        </div>
        <div className="hero-carousel-meta">
          <span>01 — 05</span>
          <span>Listening first. Acting together.</span>
        </div>
        <div className="hero-controls" aria-label="Carousel controls">
          <div
            className="hero-pagination"
            role="tablist"
            aria-label="Choose a mission story"
          >
            {heroSlides.map((item, index) => (
              <button
                key={item.title}
                className={`hero-pagination-button ${index === activeSlide ? "is-active" : ""} focus-ring`}
                role="tab"
                aria-selected={index === activeSlide}
                aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
                onClick={() => setActiveSlide(index)}
                data-testid={`button-hero-slide-${index + 1}`}
              >
                {index === activeSlide ? (
                  <span className="progress-track">
                    <span
                      className="progress-fill"
                      key={`${activeSlide}-${index}`}
                    />
                  </span>
                ) : (
                  <span className="pagination-dot" />
                )}
              </button>
            ))}
          </div>
          <div className="hero-arrow-controls">
            <button
              className="hero-arrow focus-ring"
              onClick={() => moveSlide(-1)}
              aria-label="Previous slide"
              data-testid="button-hero-previous"
            >
              <ArrowRight size={17} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              className="hero-arrow focus-ring"
              onClick={() => moveSlide(1)}
              aria-label="Next slide"
              data-testid="button-hero-next"
            >
              <ArrowRight size={17} />
            </button>
            <button
              className="hero-pause focus-ring"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-label={
                userPaused
                  ? "Resume automatic carousel"
                  : "Pause automatic carousel"
              }
              aria-pressed={userPaused}
              data-testid="button-hero-pause"
            >
              {userPaused ? "Play" : "Pause"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
