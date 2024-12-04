import { forwardRef, HTMLAttributes } from "react";
import { useAppState } from "./AppState";
import { ItemArrangeEditor } from "./ItemArrangeEditor";
import { ItemArrangeControls } from "./ItemArrangeControls";
import { cn } from "@/lib/utils";

export const ItemArrange = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    itemIndex: number;
  }
>(({ itemIndex, className, ...props }, ref) => {
  const form = useAppState();
  const item = form.watch(`items.${itemIndex}`);

  return (
    <div
      ref={ref}
      className={cn("h-[calc(100lvh-101px)] relative", className)}
      {...props}
    >
      <ItemArrangeEditor
        assets={item.assets}
        marker={item.marker}
        id={item.id}
        lookAt={
          form.watch(`items.${itemIndex}.lookAt`) === "camera"
            ? "camera"
            : undefined
        }
        rotation={form.watch(`items.${itemIndex}.rotation`)}
        position={form.watch(`items.${itemIndex}.position`)}
        scale={form.watch(`items.${itemIndex}.scale`)}
        onPositionChange={({ x, y, z }) => {
          form.setValue(`items.${itemIndex}.position.x`, x);
          form.setValue(`items.${itemIndex}.position.y`, y);
          form.setValue(`items.${itemIndex}.position.z`, z);
        }}
        onRotationChange={({ x, y, z }) => {
          form.setValue(`items.${itemIndex}.rotation.x`, x);
          form.setValue(`items.${itemIndex}.rotation.y`, y);
          form.setValue(`items.${itemIndex}.rotation.z`, z);
        }}
        onScaleChange={({ x, y, z }) => {
          if (form.getValues(`items.${itemIndex}.isUniformScale`)) {
            const prevScale = form.getValues(`items.${itemIndex}.scale`);
            const didXChange = prevScale.x !== x;
            const didYChange = prevScale.y !== y;
            const value = didXChange ? x : didYChange ? y : z;
            form.setValue(
              `items.${itemIndex}.scale.x` as `items.${number}.rotation.x`,
              value
            );
            form.setValue(
              `items.${itemIndex}.scale.y` as `items.${number}.rotation.y`,
              value
            );
            form.setValue(
              `items.${itemIndex}.scale.z` as `items.${number}.rotation.z`,
              value
            );
            return;
          }
          form.setValue(`items.${itemIndex}.scale.x`, x);
          form.setValue(`items.${itemIndex}.scale.y`, y);
          form.setValue(`items.${itemIndex}.scale.z`, z);
        }}
        shouldPlayAnimation={form.watch(
          `items.${itemIndex}.shouldPlayAnimation`
        )}
      />

      <div className="absolute top-2 right-2 w-96">
        <ItemArrangeControls itemIndex={itemIndex} />
      </div>
    </div>
  );
});
