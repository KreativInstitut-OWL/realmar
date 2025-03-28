import { radiansToDegrees } from "@/lib/math";
import {
  composeMatrix4WithMatrixComponentAndComponent,
  MatrixComponent,
  QuaternionComponent,
  useDecomposeMatrix4,
  Vector3Component,
} from "@/lib/three";
import {
  Entity,
  isEntityModel,
  isEntityVideo,
  Item,
  useEntityAsset,
  useStore,
} from "@/store";
import {
  ArrowRightToLine,
  Link2,
  PauseCircle,
  PlayCircle,
  Repeat,
  Unlink2,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback } from "react";
import { FormControlNumber } from "./FormControlNumber";
import {
  FormControl,
  FormGroup,
  FormItem,
  FormLabel,
  FormRow,
  FormTitle,
} from "./ui/form";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Toggle } from "./ui/toggle";

export function EntityProperties({
  item,
  entity,
}: {
  item: Item;
  entity: Entity;
}) {
  const { data: asset } = useEntityAsset(entity);

  const { position, rotation, scale } = useDecomposeMatrix4(entity?.transform);

  const updateEntity = useCallback(
    (updatePayload: Partial<Entity>) => {
      if (!item.id || !entity.id) return;
      useStore.getState().setItemEntity(item.id, entity.id, updatePayload);
    },
    [item.id, entity.id]
  );

  const updateEntityTransform = useCallback(
    (
      newValue: number | null,
      component: QuaternionComponent | Vector3Component,
      matrixComponent: MatrixComponent
    ) => {
      if (typeof newValue !== "number") return;
      const newTransform = composeMatrix4WithMatrixComponentAndComponent(
        entity.transform,
        matrixComponent,
        component,
        newValue,
        entity.editorScaleUniformly
      );

      updateEntity({ transform: newTransform.toArray() });
    },
    [entity.editorScaleUniformly, entity.transform, updateEntity]
  );

  if (!item || !entity || !asset) return null;

  return (
    <div className="grid gap-4">
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
                updateEntityTransform(newValue, component, "position")
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
              pressed={entity.lookAtCamera}
              onPressedChange={(lookAtCamera) => {
                updateEntity({ lookAtCamera });
              }}
              aria-label="Look at camera"
              tooltip="Look at camera"
            >
              {entity.lookAtCamera ? <Video /> : <VideoOff />}
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
                updateEntityTransform(newValue, component, "rotation")
              }
              disabled={entity.lookAtCamera}
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
              pressed={entity.editorScaleUniformly}
              onPressedChange={(editorScaleUniformly) => {
                updateEntity({
                  editorScaleUniformly,
                });
              }}
              aria-label="Scale uniformly"
              tooltip="Scale uniformly"
            >
              {entity.editorScaleUniformly ? <Link2 /> : <Unlink2 />}
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
                updateEntityTransform(newValue, component, "scale")
              }
              hidden={component === "z" && !isEntityModel(entity)}
            />
          ))}
        </FormRow>
      </FormGroup>
      {isEntityModel(entity) && (
        <>
          <Separator />
          <FormGroup>
            <FormTitle>3D Model</FormTitle>
            <FormRow className="flex">
              <Toggle
                tooltip="Play Animation"
                aria-label="Play Animation"
                size="sm"
                pressed={entity.playAnimation}
                onPressedChange={(playAnimation) => {
                  updateEntity({ playAnimation });
                }}
              >
                {entity.playAnimation ? <PlayCircle /> : <PauseCircle />} Play
                Animation
              </Toggle>
            </FormRow>
            <FormRow>
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    size="sm"
                    onCheckedChange={(playAnimation) => {
                      updateEntity({ playAnimation });
                    }}
                    checked={entity.playAnimation}
                  />
                </FormControl>
                <FormLabel>Play Animation</FormLabel>
              </FormItem>
            </FormRow>
          </FormGroup>
        </>
      )}

      {isEntityVideo(entity) && (
        <>
          <Separator />
          <FormGroup>
            <FormTitle>Video</FormTitle>
            <FormRow className="flex">
              <Toggle
                tooltip="Autoplay"
                aria-label="Autoplay"
                size="sm"
                pressed={entity.autoplay}
                onPressedChange={(autoplay) => {
                  updateEntity({ autoplay });
                }}
              >
                {entity.autoplay ? <PlayCircle /> : <PauseCircle />} Autoplay
              </Toggle>
              <Toggle
                tooltip="Muted"
                aria-label="Muted"
                size="sm"
                pressed={entity.muted}
                onPressedChange={(muted) => {
                  updateEntity({ muted });
                }}
              >
                {entity.muted ? <VolumeX /> : <Volume2 />} Muted
              </Toggle>
              <Toggle
                tooltip="Loop"
                aria-label="Loop"
                size="sm"
                pressed={entity.loop}
                onPressedChange={(loop) => {
                  updateEntity({ loop });
                }}
              >
                {entity.loop ? <Repeat /> : <ArrowRightToLine />} Loop
              </Toggle>
            </FormRow>
            <FormRow>
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    size="sm"
                    onCheckedChange={(autoplay) => {
                      updateEntity({ autoplay });
                    }}
                    checked={entity.autoplay}
                  />
                </FormControl>
                <FormLabel>Autoplay</FormLabel>
              </FormItem>
            </FormRow>
            <FormRow>
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    size="sm"
                    onCheckedChange={(muted) => {
                      updateEntity({ muted });
                    }}
                    checked={entity.muted}
                  />
                </FormControl>
                <FormLabel>Muted</FormLabel>
              </FormItem>
            </FormRow>
            <FormRow>
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    size="sm"
                    onCheckedChange={(loop) => {
                      updateEntity({ loop });
                    }}
                    checked={entity.loop}
                  />
                </FormControl>
                <FormLabel>Loop</FormLabel>
              </FormItem>
            </FormRow>
          </FormGroup>
        </>
      )}

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
