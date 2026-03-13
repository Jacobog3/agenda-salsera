import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-2xl border border-black/[0.04] bg-card text-card-foreground shadow-soft md:rounded-3xl",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 md:p-5", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export { Card, CardContent };
