import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand-logo ${compact ? "brand-logo--compact" : ""}`} aria-label="HOP & HAM beranda">
      <svg className="brand-logo__mark" viewBox="0 0 64 64" role="img" aria-label="Logo HOP & HAM">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19 43V23M19 33h12M31 43V23M39 43V26c0-6 8-6 8 0v17M39 34h8" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 19c-1.5-4 .1-7.5 3.1-8.4 2.4 3 2.1 6.4-.7 9M47 20c.2-4.4 2.5-7.1 5.6-7.1 1.5 3.5.2 6.4-3.2 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="32" cy="49" r="1.8" fill="currentColor" />
      </svg>
      {!compact && <span className="brand-logo__type"><strong>HOP <i>&</i> HAM</strong><small>ANIMAL & HABITAT BOUTIQUE</small></span>}
    </Link>
  );
}
