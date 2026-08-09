import { LogoIcon } from "@/components/brand/logo-icon";

export function BrandLockup({
  iconSize = 40,
  compact = false,
  tagline,
  className = ""
}: {
  iconSize?: number;
  compact?: boolean;
  tagline?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <LogoIcon size={iconSize} />
      <span className="font-display font-extrabold leading-none tracking-[-0.035em]">
        <span className="text-gray-900">Somos</span>
        <span className="text-salsaRed-500">Salsa</span>
        {!compact && tagline && (
          <span className="mt-1.5 block text-[0.32em] font-bold uppercase tracking-[0.18em] text-gray-500">
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
