import { cva } from "class-variance-authority";

export const shortcutVariants = cva(
  "ml-auto text-xs tracking-widest text-gray-11"
);
export const separatorVariants = cva("-mx-1 my-1 h-px bg-gray-6");
export const labelVariants = cva(
  "px-2 py-1.5 text-sm font-semibold text-gray-11",
  {
    variants: {
      inset: {
        true: "pl-8",
      },
    },
  }
);
export const radioItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-azure-4 focus:text-azure-12 data-disabled:not-[[data-disabled=false]]:pointer-events-none data-disabled:not-[[data-disabled=false]]:opacity-50"
);
export const radioItemIndicatorVariants = cva(
  "absolute left-2 flex h-3.5 w-3.5 items-center justify-center [&>svg]:size-2 [&>svg]:shrink-0 [&>svg]:fill-current"
);
export const checkboxItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-azure-4 focus:text-azure-12 data-disabled:not-[[data-disabled=false]]:pointer-events-none data-disabled:not-[[data-disabled=false]]:opacity-50"
);
export const checkboxItemIndicatorVariants = cva(
  "absolute flex h-3.5 w-3.5 items-center justify-center [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      position: {
        left: "left-2",
        right: "right-2",
      },
    },
    defaultVariants: {
      position: "left",
    },
  }
);
export const itemVariants = cva(
  "relative flex gap-2 cursor-default select-none items-center text-gray-12 rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-azure-4 data-[selected=true]:bg-azure-4 focus:text-azure-12 data-[selected=true]:text-azure-12 data-disabled:not-[[data-disabled=false]]:pointer-events-none data-disabled:not-[[data-disabled=false]]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      inset: {
        true: "pl-8",
      },
    },
  }
);
export const contentVariants = cva(
  "z-50 min-w-[8rem] max-h-(--radix-popper-available-height) overflow-y-auto overflow-x-clip rounded-md border border-gray-4 bg-gray-1/70 dark:bg-gray-1/60 backdrop-brightness-125 dark:backdrop-brightness-75 backdrop-blur-md p-1 text-gray-12 shadow-md ring-offset-transparent animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popper-transform-origin)"
);
export const subContentVariants = cva(
  "z-50 min-w-[8rem] max-h-(--radix-popper-available-height) overflow-y-auto overflow-x-clip rounded-md border border-gray-4 bg-gray-1/70 dark:bg-gray-1/60 backdrop-brightness-125 dark:backdrop-brightness-75 backdrop-blur-md p-1 text-gray-12 shadow-md ring-offset-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popper-transform-origin)"
);
export const subTriggerVariants = cva(
  "flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-azure-4 focus:text-azure-12 data-[state=open]:bg-azure-4 data-[state=open]:text-azure-12 [&_[data-chevron]]:ml-auto [&_[data-chevron]]:size-4",
  {
    variants: {
      inset: {
        true: "pl-8",
      },
    },
  }
);
export const triggerVariants = cva("");
