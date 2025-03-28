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
import { useCallback, useMemo } from "react";
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

export function ItemArrangeControls() {
  const setItemEntity = useStore((state) => state.setItemEntity);
  const item = useCurrentItem();
  const currentEntity = item?.entityNavigation.current;
  const { data: currentEntityAsset } = useAsset(currentEntity?.assetId);

  const currentEntityAssetType = currentEntityAsset?.file.type;

  const currentEntityIsModel = currentEntityAssetType?.startsWith("model/");
  const currentEntityIsVideo = currentEntityAssetType?.startsWith("video/");

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
        currentEntity.editorScaleUniformly
      );

      setItemEntity(item.id, currentEntity.id, {
        transform: newTransform.toArray(),
      });
    },
    [currentEntity, item.id, setItemEntity]
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
              pressed={currentEntity.editorScaleUniformly}
              onPressedChange={(editorScaleUniformly) => {
                setItemEntity(item.id, currentEntity.id, {
                  editorScaleUniformly,
                });
              }}
              aria-label="Scale uniformly"
              tooltip="Scale uniformly"
            >
              {currentEntity.editorScaleUniformly ? <Link2 /> : <Unlink2 />}
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
              hidden={component === "z" && !currentEntityIsModel}
            />
          ))}
        </FormRow>
      </FormGroup>
      {currentEntityIsModel && (
        <>
          <Separator />
          <FormGroup>
            <FormTitle>3D Model</FormTitle>
            <FormRow className="flex">
              <Toggle
                tooltip="Play Animation"
                aria-label="Play Animation"
                size="sm"
                pressed={currentEntity.modelPlayAnimation}
                onPressedChange={(modelPlayAnimation) => {
                  setItemEntity(item.id, currentEntity.id, {
                    modelPlayAnimation,
                  });
                }}
              >
                {currentEntity.modelPlayAnimation ? (
                  <PlayCircle />
                ) : (
                  <PauseCircle />
                )}{" "}
                Play Animation
              </Toggle>
            </FormRow>
            <FormRow>
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    size="sm"
                    onCheckedChange={(modelPlayAnimation) => {
                      setItemEntity(item.id, currentEntity.id, {
                        modelPlayAnimation,
                      });
                    }}
                    checked={currentEntity.modelPlayAnimation}
                  />
                </FormControl>
                <FormLabel>Play Animation</FormLabel>
              </FormItem>
            </FormRow>
          </FormGroup>
        </>
      )}

      {currentEntityIsVideo && (
        <>
          <Separator />
          <FormGroup>
            <FormTitle>Video</FormTitle>
            <FormRow className="flex">
              <Toggle
                tooltip="Autoplay"
                aria-label="Autoplay"
                size="sm"
                pressed={currentEntity.videoAutoplay}
                onPressedChange={(videoAutoplay) => {
                  setItemEntity(item.id, currentEntity.id, {
                    videoAutoplay,
                  });
                }}
              >
                {currentEntity.videoAutoplay ? <PlayCircle /> : <PauseCircle />}{" "}
                Autoplay
              </Toggle>
              <Toggle
                tooltip="Muted"
                aria-label="Muted"
                size="sm"
                pressed={currentEntity.videoMuted}
                onPressedChange={(videoMuted) => {
                  setItemEntity(item.id, currentEntity.id, {
                    videoMuted,
                  });
                }}
              >
                {currentEntity.videoMuted ? <VolumeX /> : <Volume2 />} Muted
              </Toggle>
              <Toggle
                tooltip="Loop"
                aria-label="Loop"
                size="sm"
                pressed={currentEntity.videoLoop}
                onPressedChange={(videoLoop) => {
                  setItemEntity(item.id, currentEntity.id, {
                    videoLoop,
                  });
                }}
              >
                {currentEntity.videoLoop ? <Repeat /> : <ArrowRightToLine />}{" "}
                Loop
              </Toggle>
            </FormRow>
            <FormRow>
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    size="sm"
                    onCheckedChange={(videoAutoplay) => {
                      setItemEntity(item.id, currentEntity.id, {
                        videoAutoplay,
                      });
                    }}
                    checked={currentEntity.videoAutoplay}
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
                    onCheckedChange={(videoMuted) => {
                      setItemEntity(item.id, currentEntity.id, {
                        videoMuted,
                      });
                      // when setting muted to false
                    }}
                    checked={currentEntity.videoMuted}
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
                    onCheckedChange={(videoLoop) => {
                      setItemEntity(item.id, currentEntity.id, {
                        videoLoop,
                      });
                    }}
                    checked={currentEntity.videoLoop}
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
