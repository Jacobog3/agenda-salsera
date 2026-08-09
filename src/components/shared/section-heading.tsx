import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const toneClasses = {
  blue: {
    eyebrow: "text-brand-700",
    icon: "bg-brand-50 text-brand-600"
  },
  red: {
    eyebrow: "text-salsaRed-700",
    icon: "bg-salsaRed-50 text-salsaRed-600"
  },
  green: {
    eyebrow: "text-salsaGreen-700",
    icon: "bg-salsaGreen-50 text-salsaGreen-600"
  },
  yellow: {
    eyebrow: "text-accentScale-700",
    icon: "bg-accentScale-50 text-accentScale-700"
  },
  orange: {
    eyebrow: "text-salsaOrange-700",
    icon: "bg-salsaOrange-50 text-salsaOrange-700"
  }
} as const;

export function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  className,
  as: Tag = "h2",
  tone = "blue"
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  as?: "h1" | "h2";
  tone?: keyof typeof toneClasses;
}) {
  const colors = toneClasses[tone];

  return (
    <div className={cn("space-y-1", className)}>
      {eyebrow ? (
        <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", colors.eyebrow)}>
          {eyebrow}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        {Icon && (
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colors.icon)}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
        <Tag className="section-title max-w-2xl">{title}</Tag>
      </div>
      {description ? <p className="section-copy mt-1">{description}</p> : null}
    </div>
  );
}
