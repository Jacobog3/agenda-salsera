import { Search } from "lucide-react";

export function EmptyState({
  title,
  description
}: {
  title: string;
  description?: string;
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
    </div>
  );
}
