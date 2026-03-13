import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-surface-soft px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 md:h-12 md:px-4 md:py-3",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
