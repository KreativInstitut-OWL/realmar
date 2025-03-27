import { radiansToDegrees } from "@/lib/math";
import {
  composeMatrix4WithMatrixComponentAndComponent,
  decomposeMatrix4,
  DEFAULT_TRANSFORM,
  MatrixComponent,
  QuaternionComponent,
  Vector3Component,
} from "@/lib/three";
import { useAsset, useCurrentItem, useStore } from "@/store";
import { Link2, Unlink2, Video, VideoOff } from "lucide-react";
import { useCallback, useMemo } from "react";
import { FormControlNumber } from "./FormControlNumber";
import { FormGroup, FormItem, FormLabel, FormRow, FormTitle } from "./ui/form";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Toggle } from "./ui/toggle";

export function ItemArrangeControls() {
  const setItem = useStore((state) => state.setItem);
  const setItemEntity = useStore((state) => state.setItemEntity);

  const item = useCurrentItem();
  const currentEntity = item?.entityNavigation.current;
  const { data: currentEntityAsset } = useAsset(currentEntity?.assetId);

  const currentEntityAssetType = currentEntityAsset?.file.type;

  const currentEntityIs3dModel = currentEntityAssetType?.startsWith("model/");

  const { position, rotation, scale } = useMemo(
    () => decomposeMatrix4(currentEntity?.transform ?? DEFAULT_TRANSFORM),
    [currentEntity?.transform]
  );

  const handleComponentChange = useCallback(
    (
      newValue: number | null,
      component: QuaternionComponent | Vector3Component,
      matrixComponent: MatrixComponent
    ) => {
      if (typeof newValue !== "number" || !currentEntity?.id) return;
      const newTransform = composeMatrix4WithMatrixComponentAndComponent(
        currentEntity.transform,
        matrixComponent,
        component,
        newValue,
        item.editorScaleUniformly
      );

      setItemEntity(item.id, currentEntity.id, {
        transform: newTransform.toArray(),
      });
    },
    [currentEntity, item.editorScaleUniformly, item.id, setItemEntity]
  );

  if (!item || !currentEntity || !currentEntityAsset) return null;

  return (
    <div className="grid gap-3">
      {/* Position section */}
      <FormGroup>
        <FormTitle>Position</FormTitle>
        <FormRow columns={3}>
          {(["x", "y", "z"] as const).map((component) => (
            <FormControlNumber
              key={component}
              description={`${component.toUpperCase()}-position`}
              label={component.toUpperCase()}
              step={0.1}
              formatOptions={{
                style: "decimal",
                maximumFractionDigits: 5,
              }}
              value={position[component]}
              onChange={(newValue) =>
                handleComponentChange(newValue, component, "position")
              }
            />
          ))}
        </FormRow>
      </FormGroup>
      <FormGroup>
        <FormTitle>Rotation</FormTitle>
        <FormRow
          columns={3}
          end={
            <Toggle
              size="icon-sm"
              pressed={currentEntity.lookAtCamera}
              onPressedChange={(lookAtCamera) => {
                setItemEntity(item.id, currentEntity.id, { lookAtCamera });
              }}
              aria-label="Look at camera"
              tooltip="Look at camera"
            >
              {currentEntity.lookAtCamera ? <Video /> : <VideoOff />}
            </Toggle>
          }
        >
          {(["x", "y", "z"] as const).map((component) => (
            <FormControlNumber
              key={component}
              description={`${component.toUpperCase()}-rotation`}
              label={component.toUpperCase()}
              step={1}
              formatOptions={{
                style: "unit",
                unit: "degree",
                unitDisplay: "narrow",
                maximumFractionDigits: 5,
              }}
              value={radiansToDegrees(rotation[component])}
              onChange={(newValue) =>
                handleComponentChange(newValue, component, "rotation")
              }
              disabled={currentEntity.lookAtCamera}
            />
          ))}
        </FormRow>
      </FormGroup>
      {/* Scale section */}
      <FormGroup>
        <FormTitle>Scale</FormTitle>
        <FormRow
          columns={3}
          end={
            <Toggle
              size="icon-sm"
              pressed={item.editorScaleUniformly}
              onPressedChange={(editorScaleUniformly) => {
                setItem(item.id, { editorScaleUniformly });
              }}
              aria-label="Scale uniformly"
              tooltip="Scale uniformly"
            >
              {item.editorScaleUniformly ? <Link2 /> : <Unlink2 />}
            </Toggle>
          }
        >
          {(["x", "y", "z"] as const).map((component) => (
            <FormControlNumber
              key={component}
              description={`${component.toUpperCase()}-scale`}
              label={component.toUpperCase()}
              step={0.1}
              formatOptions={{
                style: "decimal",
                maximumFractionDigits: 5,
              }}
              value={scale[component]}
              onChange={(newValue) =>
                handleComponentChange(newValue, component, "scale")
              }
              hidden={component === "z" && !currentEntityIs3dModel}
            />
          ))}
        </FormRow>
      </FormGroup>
      <Separator />
      <FormGroup>
        <FormTitle
        // end={
        //   <Button
        //     variant="ghost"
        //     size="icon-sm"
        //     onClick={() => {}}
        //     tooltip="Add Component"
        //   >
        //     <Plus />
        //   </Button>
        // }
        >
          OBJ Properties
        </FormTitle>
        {currentEntityIs3dModel && (
          <FormRow>
            <FormItem className="flex justify-between items-center">
              <FormLabel>Play Animation</FormLabel>
              <div className="flex justify-end">
                <Switch
                  size="sm"
                  className="ml-auto"
                  onCheckedChange={(playAnimation) => {
                    setItemEntity(item.id, currentEntity.id, {
                      playAnimation,
                    });
                  }}
                  checked={currentEntity.playAnimation}
                />
              </div>
            </FormItem>
          </FormRow>
        )}
      </FormGroup>

      {/* <FormItem className="flex gap-2 items-center space-y-0 w-full">
        <div className="space-y-0.5">
          <FormLabel>Link Transforms</FormLabel>
          <FormDescription>
            Link transforms of all entities in this item
          </FormDescription>
        </div>
        <Switch
          className="ml-auto"
          onCheckedChange={(checked) => {
            setItem(item.id, {
              editorLinkTransforms: checked,
            });
          }}
          checked={item.editorLinkTransforms}
        />
      </FormItem> */}
      {/* <Button
        onClick={() => {
          setItemEntity(item.id, currentEntity.id, {
            transform: new THREE.Matrix4().toArray(),
          });
        }}
      >
        Reset Transform
      </Button> */}
    </div>
  );
}
