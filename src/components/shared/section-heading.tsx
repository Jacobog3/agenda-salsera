import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  className
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <Icon className="h-4 w-4 text-brand-600" strokeWidth={2} />
          </span>
        )}
        <h2 className="section-title max-w-2xl">{title}</h2>
      </div>
      {description ? <p className="section-copy mt-1">{description}</p> : null}
    </div>
  );
}
