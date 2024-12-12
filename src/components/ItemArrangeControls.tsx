import { degreesToRadians, radiansToDegrees } from "@/lib/math";
import { useCurrentItemAssetData, useStore } from "@/store";
import { ChevronLeft, RotateCcw } from "lucide-react";
import * as THREE from "three";
import { Button } from "./ui/button";
import { FormControl, FormDescription, FormItem, FormLabel } from "./ui/form";
import { InputNumber } from "./ui/input-number";
import { Switch } from "./ui/switch";

const safeScale = (value: number) => (value === 0 ? 1e-6 : value);

export function ItemArrangeControls() {
  const currentItemId = useStore((state) => state.currentItemId);
  const item = useStore((state) =>
    state.items.find((i) => i.id === currentItemId)
  );
  const setItem = useStore((state) => state.setItem);

  const { data } = useCurrentItemAssetData();

  if (!item || !data) return null;

  const matrix = new THREE.Matrix4().fromArray(item.transform);
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, quaternion, scale);
  const rotation = new THREE.Euler().setFromQuaternion(quaternion);

  return (
    <div className="grid grid-cols-1 gap-8 bg-white p-4">
      <div className="grid grid-cols-6 items-center">
        <Button
          variant="ghost"
          size="icon"
          disabled={!data.prevAsset}
          onClick={() => {
            setItem(item.id, { editorSelectedAssetId: data.prevAsset?.id });
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="col-span-4 text-center truncate">
          {data.selectedAsset?.file?.name ?? "No asset"} (
          {data.selectedAssetIndex + 1}/{data.assetCount})
        </div>
        <Button
          className="ml-auto"
          variant="ghost"
          size="icon"
          disabled={!data.nextAsset}
          onClick={() => {
            setItem(item.id, { editorSelectedAssetId: data.nextAsset?.id });
          }}
        >
          <ChevronLeft className="transform rotate-180" />
        </Button>
      </div>
      <Button
        onClick={() => {
          setItem(item.id, { transform: new THREE.Matrix4().toArray() });
        }}
      >
        Reset Transform
      </Button>
      {["rotation", "position", "scale"].map((vectorType) => (
        <div className="flex flex-col gap-2" key={vectorType}>
          <div className="flex gap-4 items-center">
            <span className="">
              {vectorType.charAt(0).toUpperCase() + vectorType.slice(1)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label={`Reset ${vectorType}`}
              onClick={() => {
                switch (vectorType) {
                  case "rotation":
                    setItem(item.id, {
                      transform: new THREE.Matrix4()
                        .compose(position, new THREE.Quaternion(), scale)
                        .toArray(),
                    });
                    break;
                  case "position":
                    setItem(item.id, {
                      transform: new THREE.Matrix4()
                        .compose(new THREE.Vector3(), quaternion, scale)
                        .toArray(),
                    });
                    break;
                  case "scale":
                    setItem(item.id, {
                      transform: new THREE.Matrix4()
                        .compose(
                          position,
                          quaternion,
                          new THREE.Vector3(1, 1, 1)
                        )
                        .toArray(),
                    });
                    break;
                }
              }}
            >
              <RotateCcw />
            </Button>
            {vectorType === "rotation" && (
              <FormItem className="flex gap-2 items-center space-y-0 ml-auto">
                <FormLabel>Look at camera</FormLabel>
                <Switch
                  onCheckedChange={(checked) => {
                    setItem(item.id, { lookAtCamera: checked });
                  }}
                  checked={item.lookAtCamera}
                />
              </FormItem>
            )}
            {vectorType === "scale" && (
              <FormItem className="flex gap-2 items-center space-y-0 ml-auto">
                <FormLabel>Uniform</FormLabel>
                <Switch
                  onCheckedChange={(checked) => {
                    setItem(item.id, { editorShouldScaleUniformly: checked });
                  }}
                  checked={item.editorShouldScaleUniformly}
                />
              </FormItem>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(["x", "y", "z"] as const).map((axis) => {
              const value =
                vectorType === "position"
                  ? position[axis]
                  : vectorType === "rotation"
                  ? radiansToDegrees(rotation[axis])
                  : scale[axis];

              return (
                <FormItem
                  key={axis}
                  className="flex space-y-0 gap-2 items-center"
                >
                  <FormLabel className="w-3">
                    <span className="sr-only">{vectorType}</span>
                    {axis.toUpperCase()}
                  </FormLabel>
                  <FormControl>
                    <InputNumber
                      step={0.1}
                      formatOptions={
                        vectorType === "rotation"
                          ? {
                              style: "unit",
                              unit: "degree",
                              unitDisplay: "narrow",
                              maximumFractionDigits: 5,
                            }
                          : {
                              style: "decimal",
                              maximumFractionDigits: 5,
                            }
                      }
                      value={Object.is(value, -0) ? 0 : value}
                      onChange={(newValue) => {
                        if (typeof newValue !== "number") return;
                        // create a new transform matrix based on the new value for the axis and vector type
                        const newTransform = new THREE.Matrix4().compose(
                          vectorType === "position"
                            ? new THREE.Vector3(
                                axis === "x" ? newValue : position.x,
                                axis === "y" ? newValue : position.y,
                                axis === "z" ? newValue : position.z
                              )
                            : position,
                          vectorType === "rotation"
                            ? new THREE.Quaternion().setFromEuler(
                                new THREE.Euler(
                                  axis === "x"
                                    ? degreesToRadians(newValue)
                                    : rotation.x,
                                  axis === "y"
                                    ? degreesToRadians(newValue)
                                    : rotation.y,
                                  axis === "z"
                                    ? degreesToRadians(newValue)
                                    : rotation.z
                                )
                              )
                            : quaternion,
                          vectorType === "scale"
                            ? new THREE.Vector3(
                                axis === "x" || item.editorShouldScaleUniformly
                                  ? safeScale(newValue)
                                  : scale.x,
                                axis === "y" || item.editorShouldScaleUniformly
                                  ? safeScale(newValue)
                                  : scale.y,
                                axis === "z" || item.editorShouldScaleUniformly
                                  ? safeScale(newValue)
                                  : scale.z
                              )
                            : scale
                        );

                        setItem(item.id, { transform: newTransform.toArray() });
                      }}
                    />
                  </FormControl>
                </FormItem>
              );
            })}
          </div>
        </div>
      ))}

      <FormItem className="flex gap-2 items-center space-y-0 w-full">
        <div className="space-y-0.5">
          <FormLabel>Play Animation</FormLabel>
          <FormDescription>If available in 3D model</FormDescription>
        </div>
        <Switch
          className="ml-auto"
          onCheckedChange={(checked) => {
            setItem(item.id, { shouldPlayAnimation: checked });
          }}
          checked={item.shouldPlayAnimation}
        />
      </FormItem>
    </div>
  );
}
