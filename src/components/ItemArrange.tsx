import { cn } from "@/lib/utils";
import { useStore, useCurrentItemAssetData } from "@/store";
import { forwardRef, HTMLAttributes } from "react";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemArrangeControls } from "./ItemArrangeControls";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { data } = useCurrentItemAssetData();
  const setItem = useStore((state) => state.setItem);

  const item = useStore((state) => state.items.find((i) => i.id === data?.id));

  if (!item || !data) return null;

  return (
    <div
      ref={ref}
      className={cn("h-[calc(100lvh-101px)] relative", className)}
      {...props}
    >
      <ItemArrangeEditor
        asset={data.selectedAsset}
        marker={data.marker}
        id={item.id}
        lookAtCamera={item.lookAtCamera}
        shouldPlayAnimation={item.shouldPlayAnimation}
        cameraPosition={item.editorCameraPosition}
        onCameraPositionChange={(cameraPosition) => {
          setItem(item.id, { editorCameraPosition: cameraPosition });
        }}
        transform={item.transform}
        onTransformChange={(transform) => {
          setItem(item.id, { transform });
        }}
      />

      <div className="absolute top-2 right-2 w-96">
        <ItemArrangeControls />
      </div>
    </div>
  );
});
