import { cn } from "@/lib/utils";
import { useItem, useStore } from "@/store";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { ItemTabs } from "./ItemTabs";
import { Target } from "./Target";
import { Sortable } from "./ui/sortable";

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
  const moveItem = useStore((state) => state.moveItem);

  return (
    <TabsPrimitive.List ref={ref} className={cn("", className)} {...props}>
      <Sortable
        items={items.map((item, itemIndex) => ({
          id: item.id,
          node: (
            <ItemListTabsTrigger
              key={item.id}
              itemId={item.id}
              itemIndex={itemIndex}
            />
          ),
        }))}
        onItemMove={(oldIndex, newIndex) => {
          moveItem(oldIndex, newIndex);
        }}
      />
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
        "w-full aspect-[16/5] flex items-start gap-4 whitespace-nowrap border-b p-4 pl-10 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-selected:bg-gray-200 relative",
        className
      )}
      {...props}
    >
      <Target
        itemId={item.id}
        assetId={item.targetAssetId}
        className="size-16"
      />
      <div className="flex flex-col self-stretch w-full items-start justify-center gap-2">
        <span>
          {item.editorName ? item.editorName : `Marker ${itemIndex + 1}`}
        </span>
        <span className="text-xs text-gray-400">
          {item.entityNavigation.count}{" "}
          {item.entityNavigation.count === 1 ? "Entity" : "Entities"}
        </span>
      </div>
      <div className="absolute top-4 left-4 text-xs">{itemIndex + 1}</div>
    </TabsPrimitive.TabsTrigger>
  );
});

export const ItemListSelectedItemContent = (
  props: React.ComponentProps<typeof ItemTabs>
) => {
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

  return <ItemTabs {...props} />;
};
