import { cn } from "@/lib/utils";
import { useStore, useCurrentItem, useAsset } from "@/store";
import { forwardRef, HTMLAttributes } from "react";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemArrangeControls } from "./ItemArrangeControls";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const setItem = useStore((state) => state.setItem);
  const setItemEntity = useStore((state) => state.setItemEntity);

  const item = useCurrentItem();
  const currentEntity = item?.entityNavigation?.current;
  const { data: currentEntityAsset } = useAsset(currentEntity?.assetId);

  const { data: targetAsset } = useAsset(item?.targetAssetId);

  if (!item) return null;

  if (!currentEntityAsset || !currentEntity) {
    return <div>Please add entities to this item.</div>;
  }

  return (
    <div
      ref={ref}
      className={cn("h-[calc(100lvh-4rem)] relative", className)}
      {...props}
    >
      <ItemArrangeEditor
        marker={targetAsset}
        id={item.id}
        cameraPosition={item.editorCameraPosition}
        onCameraPositionChange={(cameraPosition) => {
          setItem(item.id, { editorCameraPosition: cameraPosition });
        }}
        entities={item.entities}
        selectedEntityId={currentEntity.id}
        onTransformChange={(transform) => {
          setItemEntity(item.id, currentEntity.id, { transform });
        }}
        onSelectEntity={(id) => {
          setItem(item.id, {
            editorCurrentEntityId: id,
          });
        }}
        displayMode={item.displayMode}
      />

      <div className="absolute top-2 right-2 w-96">
        <ItemArrangeControls />
      </div>
    </div>
  );
});
