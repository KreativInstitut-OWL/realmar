import { cn } from "@/lib/utils";
import { useItem, useStore } from "@/store";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { GeneratedMarker } from "./GeneratedMarker";
import { ItemTabs } from "./ItemTabs";
import { Skeleton } from "./ui/skeleton";

export const ItemListRoot = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    "value" | "onValueChange"
  >
>(({ className, ...props }, ref) => {
  const currentItemId = useStore((state) => state.currentItemId);
  const setCurrentItemId = useStore((state) => state.setCurrentItemId);

  return (
    <TabsPrimitive.Root
      value={currentItemId ?? undefined}
      onValueChange={setCurrentItemId}
      orientation="vertical"
      className={cn("contents", className)}
      data-item-list-root=""
      ref={ref}
      {...props}
    />
  );
});

ItemListRoot.displayName = "ItemListRoot";

export const ItemListList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>, "children">
>(({ className, ...props }, ref) => {
  const items = useStore((state) => state.items);

  return (
    <TabsPrimitive.List ref={ref} className={cn("", className)} {...props}>
      {items.map((field, itemIndex) => (
        <React.Suspense
          key={field.id}
          fallback={<Skeleton className="w-full aspect-video" />}
        >
          <ItemListTabsTrigger
            key={field.id}
            itemId={field.id}
            itemIndex={itemIndex}
          />
        </React.Suspense>
      ))}
    </TabsPrimitive.List>
  );
});

ItemListList.displayName = "ItemListList";

const ItemListTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.TabsTrigger>,
  Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.TabsTrigger>,
    "children" | "value"
  > & { itemId: string; itemIndex: number }
>(({ className, itemId, itemIndex, ...props }, ref) => {
  const item = useItem(itemId);
  if (!item) return null;

  return (
    <TabsPrimitive.TabsTrigger
      ref={ref}
      value={itemId}
      className={cn(
        "w-full aspect-video flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-selected:bg-gray-200",
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center gap-2">
        <span>{itemIndex + 1}</span>
        {/* <div className="text-lg font-semibold">
          {item.assets.length === 0 && "Empty"}
          {item.assets.length === 1 &&
          item.assets.at(0)?.file.type.startsWith("image/") &&
          "Image"}
          {item.assets.length === 1 &&
          !item.assets.at(0)?.file.type.startsWith("image/") &&
          "Other"}
          {item.assets.length > 1 && "Gallery"}
          </div> */}
      </div>
      <GeneratedMarker id={item.id} className="size-16" />
    </TabsPrimitive.TabsTrigger>
  );
});

export const ItemListSelectedItemContent = () => {
  const currentItemId = useStore((state) => state.currentItemId);

  if (!currentItemId) {
    return (
      <div>
        <div className="text-gray-400 text-sm">
          Select an item from the list to view and edit its properties.
        </div>
      </div>
    );
  }

  return <ItemTabs />;
};
