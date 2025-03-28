import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-gray-1 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-gray-11 focus:ring-offset-2 dark:focus:ring-gray-8",
  {
    variants: {
      variant: {
        default: "bg-gray-8 text-gray-1 dark:bg-gray-2 dark:text-gray-11",
        primary: "bg-lime-9 text-gray-12 dark:bg-lime-12 dark:text-gray-1",
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
