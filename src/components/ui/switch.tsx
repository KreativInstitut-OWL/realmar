import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-1 border-transparent data-[state=unchecked]:hover:border-gray-8 transition-colors outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-azure-9 data-[state=checked]:hover:bg-azure-10 data-[state=unchecked]:bg-gray-5 overflow-clip",
  {
    variants: {
      size: {
        default: "h-5 w-9.5",
        sm: "h-4 w-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-md shadow-black/20 ring-offset-transparent transition-all",
  {
    variants: {
      size: {
        default:
          "size-4 data-[state=checked]:translate-x-[19px] data-[state=unchecked]:translate-x-px",
        sm: "size-3 data-[state=checked]:translate-x-[17px] data-[state=unchecked]:translate-x-px",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => {
  return (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ size }), className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ size }))} />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
