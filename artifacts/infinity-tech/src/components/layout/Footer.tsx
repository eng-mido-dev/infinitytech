import { Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Signature } from "@/components/ui/Signature";

/* ─── navigation ─────────────────────────────────────────── */
const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
];

/* ─── core competencies ──────────────────────────────────── */
const competencies = [
  {
    en: "Embedded Intelligence & Firmware",
    ar: "أنظمة التحكم المدمجة",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" aria-hidden>
        <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <rect x="7" y="7" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
        <path d="M4 8H2M4 12H2M16 8h2M16 12h2M8 4V2M12 4V2M8 16v2M12 16v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    en: "Strategic Communication Systems",
    ar: "أنظمة الاتصالات السيادية",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" aria-hidden>
        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6.5 13.5a5 5 0 0 1 0-7M13.5 6.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4 16a8 8 0 0 1 0-12M16 4a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    en: "Electronic Warfare & Signal Security",
    ar: "الحرب الإلكترونية وتأمين الإشارات",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" aria-hidden>
        <path d="M10 2.5L3 6.5v4c0 3.5 2.8 6.7 7 7.5 4.2-.8 7-4 7-7.5v-4L10 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    en: "Custom Industrial Hardware",
    ar: "تصميم العتاد الصناعي المتكامل",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" aria-hidden>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.22 3.22l2.12 2.12M14.66 14.66l2.12 2.12M3.22 16.78l2.12-2.12M14.66 5.34l2.12-2.12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

/* ─── socials ────────────────────────────────────────────── */
const socials = [
  {
    label: "GitHub",
    href: "https://github.com/infinitytech-dev",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/fares-salah-eng",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:admin.infinity.tech@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── component ──────────────────────────────────────────── */
export function Footer() {
  return (
    <footer dir="ltr" className="relative bg-[#0A0E13] mt-auto overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(34,211,238,0.25)] to-transparent" />

      {/* Background watermark */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span
          className="text-[clamp(4rem,14vw,10rem)] font-black uppercase whitespace-nowrap"
          style={{
            color: "rgba(34,211,238,0.03)",
            WebkitTextStroke: "1.5px rgba(34,211,238,0.12)",
            letterSpacing: "-0.04em",
            userSelect: "none",
          }}
        >
          INFINITY TECH
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ── Col 1: Brand + tagline + socials ── */}
          <div className="lg:col-span-1 space-y-5">
            <div>
              <span className="text-xl font-black tracking-tight text-foreground">
                Infinity <span className="font-light text-muted-foreground">Tech</span>
              </span>
            </div>

            <p
              className="text-[13px] text-muted-foreground/80 leading-relaxed tracking-wide"
              style={{ letterSpacing: "0.035em" }}
            >
              Architecting mission-critical infrastructure through advanced Embedded Systems,
              Cyber-Physical Security, and Sovereign Communication Layers.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Explore nav ── */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
              Explore
            </p>
            <ul className="space-y-3">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Core Competencies ── */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
              Core Competencies
            </p>
            <ul className="space-y-4">
              {competencies.map(({ en, ar, icon }) => (
                <li key={en} className="flex items-start gap-2.5">
                  <span className="mt-[3px]">{icon}</span>
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[12.5px] font-medium text-foreground/80 leading-snug">
                      {en}
                    </span>
                    <span
                      className="text-[11px] text-muted-foreground/55 leading-snug"
                      style={{
                        fontFamily: "var(--font-arabic), 'IBM Plex Sans Arabic', sans-serif",
                        direction: "rtl",
                        textAlign: "right",
                      }}
                    >
                      {ar}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Contact ── */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
              Get In Touch
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-[13px] text-muted-foreground tracking-wide break-all">
                  admin.infinity.tech@gmail.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-[13px] text-muted-foreground tracking-wide">
                  Alexandria, Egypt
                </span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-block border border-primary/40 text-primary hover:bg-primary/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                Send a Message
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Infinity Tech. All rights reserved.
          </p>
          <Signature size="sm" opacity={0.35} color="#22D3EE" rotate={-3} animate={false} />

          {/* Hidden admin access — discreet lock icon */}
          <Link
            href="/admin"
            aria-label="System access"
            className="absolute bottom-5 right-4 sm:right-6 lg:right-8 opacity-[0.12] hover:opacity-[0.35] transition-opacity duration-500 cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
