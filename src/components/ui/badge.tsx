import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-gray-11 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-5 text-gray-12",
        primary: "bg-lime-5 text-lime-12",
      },
      size: {
        default: "h-6 px-2.5",
        lg: "h-8 px-3.5",
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
