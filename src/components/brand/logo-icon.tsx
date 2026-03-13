/**
 * ExploraGuate brand icon — uses exact brand colors from globals.css
 * brand-600: hsl(200 88% 39%) ≈ #0c81b8
 * brand-700: hsl(204 84% 29%) ≈ #0a5f8a
 * brand-100: hsl(195 100% 91%) ≈ #caf0fb
 */
const BRAND_DARK = "#0a5f8a";   // brand-700 — circle background
const BRAND_MID  = "#0c81b8";   // brand-600 — dress / accent
const BRAND_LIGHT = "#bae6fd";  // sky-200 equivalent — woman's dress highlight

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ExploraGuate"
    >
      {/* Circle background — brand-700 */}
      <circle cx="20" cy="20" r="20" fill={BRAND_DARK} />

      {/* ── MAN (white, left) — spine + arms form letter E ── */}
      <circle cx="13.5" cy="10" r="2.8" fill="white" />
      {/* Spine */}
      <line x1="13.5" y1="12.8" x2="13.5" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Top arm raised → joins woman (top bar of E) */}
      <line x1="13.5" y1="13.8" x2="21" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Middle arm (middle bar of E) */}
      <line x1="13.5" y1="17.5" x2="18" y2="17.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Legs (bottom bar of E) */}
      <line x1="13.5" y1="22" x2="10.5" y2="29" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="13.5" y1="22" x2="16.5" y2="29" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* ── WOMAN (brand-light, right) — round dress forms letter G ── */}
      <circle cx="26" cy="9.5" r="2.8" fill={BRAND_LIGHT} />
      {/* Spine */}
      <line x1="26" y1="12.3" x2="26" y2="19" stroke={BRAND_LIGHT} strokeWidth="2.5" strokeLinecap="round" />
      {/* Left arm → joins man */}
      <line x1="26" y1="14" x2="21" y2="11" stroke={BRAND_LIGHT} strokeWidth="2" strokeLinecap="round" />
      {/* Right arm extended */}
      <line x1="26" y1="15" x2="30.5" y2="17.5" stroke={BRAND_LIGHT} strokeWidth="2" strokeLinecap="round" />
      {/* Flowing round dress — the G arc */}
      <path
        d="M24 19 Q19.5 22 19 27 Q20 32 26 32 Q32 32 33 27 Q33 22 28 19 Z"
        fill={BRAND_MID}
        opacity="0.95"
      />
      {/* G crossbar inside dress */}
      <line x1="26" y1="27" x2="32" y2="27" stroke={BRAND_DARK} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
