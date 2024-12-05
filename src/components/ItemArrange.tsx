import { cn } from "@/lib/utils";
import { useStore, useCurrentItem } from "@/store";
import { forwardRef, HTMLAttributes } from "react";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemArrangeControls } from "./ItemArrangeControls";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { data: item } = useCurrentItem();
  const setItemTransform = useStore((state) => state.setItemTransform);

  // item is async so we need to get the persisted item for fast changes to the item (like transform)
  const persistedItem = useStore((state) =>
    state.items.find((i) => i.id === item?.id)
  );

  if (!item || !persistedItem) return null;

  return (
    <div
      ref={ref}
      className={cn("h-[calc(100lvh-101px)] relative", className)}
      {...props}
    >
      <ItemArrangeEditor
        assets={item.assets}
        marker={item.marker}
        id={persistedItem.id}
        lookAtCamera={persistedItem.lookAtCamera}
        shouldPlayAnimation={persistedItem.shouldPlayAnimation}
        transform={persistedItem.transform}
        onTransformChange={(transform) => {
          setItemTransform(persistedItem.id, transform);
        }}
      />

      <div className="absolute top-2 right-2 w-96">
        <ItemArrangeControls />
      </div>
    </div>
  );
});
