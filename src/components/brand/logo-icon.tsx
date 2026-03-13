const BRAND_DARK = "#0a5f8a";
const BRAND_MID = "#0c81b8";
const BRAND_GLOW = "#67d6ff";
const ACCENT = "#fb923c";

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="brand-bg" x1="12" y1="8" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor={BRAND_MID} />
          <stop offset="1" stopColor={BRAND_DARK} />
        </linearGradient>
        <linearGradient id="brand-sheen" x1="18" y1="10" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.42" />
          <stop offset="1" stopColor={BRAND_GLOW} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#brand-bg)" />
      <rect x="6" y="6" width="52" height="52" rx="16" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="22" cy="18" r="16" fill="url(#brand-sheen)" />

      <path
        d="M24 16C21.791 16 20 17.791 20 20V44C20 46.209 21.791 48 24 48H42C44.209 48 46 46.209 46 44V42C46 39.791 44.209 38 42 38H28V34H39C41.209 34 43 32.209 43 30V28C43 25.791 41.209 24 39 24H28V22H42C44.209 22 46 20.209 46 18V16H24Z"
        fill="white"
      />
      <circle cx="46" cy="46" r="5" fill={ACCENT} />
    </svg>
  );
}
