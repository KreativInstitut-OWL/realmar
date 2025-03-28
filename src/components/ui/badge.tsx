import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-white text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:focus:ring-gray-300",
  {
    variants: {
      variant: {
        default: "bg-gray-600 text-white dark:bg-gray-50 dark:text-gray-900",
        primary: "bg-primary text-black dark:bg-primary-900 dark:text-white",
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
