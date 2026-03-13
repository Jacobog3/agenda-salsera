import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  variant = "default",
  children
}: {
  className?: string;
  variant?: "default" | "accent" | "outline";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-brand-50 text-brand-700",
        variant === "accent" && "bg-accentScale-50 text-accentScale-700",
        variant === "outline" && "border border-border text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
