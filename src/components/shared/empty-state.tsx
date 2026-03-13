import Link from "next/link";
import { Search } from "lucide-react";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel
}: {
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface-soft/50 px-6 py-14 text-center md:rounded-3xl md:py-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Search className="h-5 w-5" />
      </div>
      <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.97]"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
