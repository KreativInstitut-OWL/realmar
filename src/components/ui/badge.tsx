import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-sm transition-colors border focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-gray-3 border-gray-6 text-gray-12",
        primary: "bg-lime-3 border-lime-6 text-lime-12",
      },
      size: {
        default: "h-7 px-3",
        sm: "h-5 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
