import { Check, Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="site-footer">
      <div className="container-wide footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark">IC</span>
            <span className="brand-wordmark">
              ICAADA<small>International Centre for Advocacy</small>
            </span>
          </div>
          <p>
            Prevention, awareness, research and recovery support rooted in the
            everyday realities of Nigerian communities.
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
              Volunteer with us
            </Link>
            <Link href="/get-involved" data-testid="link-footer-partner">
              Partner with ICAADA
            </Link>
            <Link href="/contact" data-testid="link-footer-contact">
              Contact our team
            </Link>
            <a href="mailto:hello@icaada.org" data-testid="link-footer-email">
              hello@icaada.org
            </a>
          </div>
        </div>
        <div className="newsletter">
          <div className="footer-title">The ICAADA brief</div>
          <p>
            A considered note on community work, new learning and ways to take
            action. About once a month.
          </p>
          {subscribed ? (
            <p data-testid="status-newsletter-success">
              <Check size={15} /> You’re on the list. Thank you.
            </p>
          ) : (
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Your email address"
                data-testid="input-newsletter-email"
              />
              <button type="submit" data-testid="button-newsletter-submit">
                Join
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="container-wide footer-bottom">
        <span>
          © 2025 ICAADA. A Nigerian nonprofit for healthier communities.
        </span>
        <span>Built on dignity, evidence and the possibility of change.</span>
      </div>
    </footer>
  );
}
