import { cn } from "@/lib/utils";
import { useStore, useCurrentItemAssets } from "@/store";
import { forwardRef, HTMLAttributes } from "react";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemArrangeControls } from "./ItemArrangeControls";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { data: itemAssets } = useCurrentItemAssets();
  const setItemTransform = useStore((state) => state.setItemTransform);

  const persistedItem = useStore((state) =>
    state.items.find((i) => i.id === itemAssets?.id)
  );

  if (!itemAssets || !persistedItem) return null;

  return (
    <div
      ref={ref}
      className={cn("h-[calc(100lvh-101px)] relative", className)}
      {...props}
    >
      <ItemArrangeEditor
        assets={itemAssets.assets}
        marker={itemAssets.marker}
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
