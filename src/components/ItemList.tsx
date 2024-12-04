import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { useAppState, useItemFieldArray } from "./AppState";
import { GeneratedMarker } from "./GeneratedMarker";
import { ItemTabs } from "./ItemTabs";

export const ItemListRoot = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    "value" | "onValueChange"
  >
>(({ className, ...props }, ref) => {
  const form = useAppState();
  const selectedItemId = form.watch("selectedItemId");

  return (
    <TabsPrimitive.Root
      value={selectedItemId ?? undefined}
      onValueChange={(id) => {
        form.setValue("selectedItemId", id);
      }}
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
  const { fields } = useItemFieldArray();

  return (
    <TabsPrimitive.List ref={ref} className={cn("", className)} {...props}>
      {fields.map((field, itemIndex) => (
        <ItemListTabsTrigger
          key={field.id}
          value={field.id}
          itemIndex={itemIndex}
        />
      ))}
    </TabsPrimitive.List>
  );
});

ItemListList.displayName = "ItemListList";

const ItemListTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.TabsTrigger>,
  Omit<
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.TabsTrigger>,
    "children"
  > & { itemIndex: number }
>(({ className, value, itemIndex, ...props }, ref) => {
  const form = useAppState();
  const item = form.watch(`items.${itemIndex}`);

  return (
    <TabsPrimitive.TabsTrigger
      ref={ref}
      value={value}
      className={cn(
        "w-full flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-selected:bg-gray-200",
        className
      )}
      {...props}
    >
      <GeneratedMarker id={item.id} className="size-8" />
      <div className="flex w-full items-center gap-2">
        <span>{itemIndex + 1}</span>
        <div className="text-lg font-semibold">
          {item.assets.length === 0 && "Empty"}
          {item.assets.length === 1 &&
            item.assets.at(0)?.file.type.startsWith("image/") &&
            "Image"}
          {item.assets.length === 1 &&
            !item.assets.at(0)?.file.type.startsWith("image/") &&
            "Other"}
          {item.assets.length > 1 && "Gallery"}
        </div>
      </div>
    </TabsPrimitive.TabsTrigger>
  );
});

export const ItemListSelectedItemContent = ({
  className,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.TabsContent>,
  "value" | "children"
>) => {
  const { fields } = useItemFieldArray();

  return fields.map((itemField, itemIndex) => (
    <TabsPrimitive.TabsContent
      key={itemField.id}
      value={itemField.id}
      className={cn("", className)}
      {...props}
    >
      <ItemTabs itemIndex={itemIndex} />
    </TabsPrimitive.TabsContent>
  ));
};
