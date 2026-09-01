"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { Footer } from "@/components/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
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
    <div className="site-shell relative">
      {/* <div className="topbar">
        <div className="container-wide topbar-inner">
          <span data-testid="text-topbar-message">
            Working alongside young people, communities and institutions across
            Nigeria.
          </span>
          <Link href="/contact" data-testid="link-topbar-contact">
            Talk to our team <ArrowUpRight size={12} />
          </Link>
        </div>
      </div> */}
      <header className="main-header fixed w-full">
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
            className="nav-cta flex items-center gap-4"
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
