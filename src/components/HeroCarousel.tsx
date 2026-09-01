import { useEffect, useState } from "react";
import { Eyebrow } from "./Eyebrow";
import { ArrowRight, MapPin } from "lucide-react";
import { ButtonLink } from "./ButtonLink";
import { heroSlides } from "@/helpers";
import Image from "next/image";

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

  const selectSlide = (index: number) => {
    setActiveSlide(index);
  };

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
            <Image src={item.image} alt={item.alt} fill/>
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
                onClick={() => selectSlide(index)}
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
