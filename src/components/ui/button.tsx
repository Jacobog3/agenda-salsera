import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 px-5 py-2.5 text-white shadow-sm hover:bg-brand-600 md:px-6 md:py-3",
        secondary:
          "border border-border bg-white px-5 py-2.5 text-foreground hover:border-brand-500 hover:text-brand-700 md:px-6 md:py-3",
        outline:
          "border border-border bg-white px-5 py-2.5 text-foreground hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 md:px-6 md:py-3",
        ghost:
          "px-3 py-2 text-muted-foreground hover:bg-surface-soft hover:text-foreground md:px-4"
      },
      size: {
        default: "",
        sm: "px-4 py-2 text-[13px]",
        lg: "px-7 py-3.5 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
