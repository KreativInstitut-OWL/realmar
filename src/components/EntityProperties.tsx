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
  getComponent,
  isEntityModel,
  isEntityText,
  isEntityVideo,
  Item,
  isAssetFont,
  systemFonts,
  useStore,
  useUpdateEntity,
  useUpdateEntityComponent,
} from "@/store";
import { SelectValue } from "@radix-ui/react-select";
import {
  ALargeSmall,
  Feather,
  Gauge,
  Link2,
  MoveDiagonal,
  MoveVertical,
  SeparatorHorizontal,
  SeparatorVertical,
  SquareRoundCorner,
  Unlink2,
} from "lucide-react";
import { useCallback } from "react";
import { FormControlNumber } from "./FormControlNumber";
import { ColorPicker } from "./ui/color-picker";
import { ControlGroup, ControlLabel, ControlRow } from "./ui/control";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { Textarea } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Toggle } from "./ui/toggle";

export function EntityProperties({
  item,
  entity,
}: {
  item: Item;
  entity: Entity | null;
}) {
  // const lookAtCamera = getComponent(entity, "look-at-camera");
  // const updateLookAtCamera = useUpdateEntityComponent(
  //   item?.id,
  //   entity?.id,
  //   "look-at-camera"
  // );

  const float = getComponent(entity, "float");
  const updateFloat = useUpdateEntityComponent(item?.id, entity?.id, "float");

  const turntable = getComponent(entity, "turntable");
  const updateTurntable = useUpdateEntityComponent(
    item?.id,
    entity?.id,
    "turntable"
  );

  const { position, rotation, scale } = useDecomposeMatrix4(entity?.transform);

  const updateEntity = useUpdateEntity(item?.id, entity?.id);

  const updateEntityTransform = useCallback(
    (
      newValue: number | null,
      component: QuaternionComponent | Vector3Component,
      matrixComponent: MatrixComponent
    ) => {
      if (typeof newValue !== "number" || !entity?.transform) return;
      const newTransform = composeMatrix4WithMatrixComponentAndComponent(
        entity.transform,
        matrixComponent,
        component,
        newValue,
        entity.editorScaleUniformly
      );

      updateEntity({ transform: newTransform.toArray() });
    },
    [entity?.editorScaleUniformly, entity?.transform, updateEntity]
  );

  const assets = useStore((s) => s.assets);

  if (!item || !entity) return null;

  return (
    <div className="grid gap-4">
      {/* Position section */}
      <ControlGroup>
        <ControlLabel level={2}>Position</ControlLabel>
        <ControlRow columns={3}>
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
        </ControlRow>
      </ControlGroup>
      <ControlGroup>
        <ControlLabel level={2}>Rotation</ControlLabel>
        <ControlRow
          columns={3}
          // end={
          //   <Toggle
          //     size="icon-sm"
          //     pressed={lookAtCamera?.enabled}
          //     onPressedChange={(enabled) => {
          //       updateLookAtCamera({ enabled });
          //     }}
          //     aria-label="Look at camera"
          //     tooltip="Look at camera"
          //   >
          //     {lookAtCamera?.enabled ? <Video /> : <VideoOff />}
          //   </Toggle>
          // }
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
              // disabled={lookAtCamera?.enabled}
            />
          ))}
        </ControlRow>
      </ControlGroup>
      {/* Scale section */}
      <ControlGroup>
        <ControlLabel level={2}>Scale</ControlLabel>
        <ControlRow
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
        </ControlRow>
      </ControlGroup>
      {/*
      
  font: SystemFont;
  curveSegments: number;
  bevelSize: number;
  bevelThickness: number;
  height: number;
  lineHeight: number;
  letterSpacing: number;
  fontSize: number;
  color: string;
  */}
      {isEntityText(entity) && (
        <>
          <Separator />
          <ControlGroup>
            <ControlLabel level={2}>Text Properties</ControlLabel>
            <FormItem asChild>
              <ControlRow columns={3}>
                <FormLabel>Text</FormLabel>
                <FormControl className="col-span-2">
                  <Textarea
                    value={entity.text}
                    onChange={(e) => {
                      updateEntity({ text: e.target.value });
                    }}
                    placeholder="Enter text"
                  />
                </FormControl>
              </ControlRow>
            </FormItem>
            <FormItem asChild>
              <ControlRow columns={3}>
                <FormLabel>Font</FormLabel>
                <Select
                  value={
                    isAssetFont(entity.font)
                      ? `asset:${entity.font.assetId}`
                      : `system:${entity.font.path}`
                  }
                  onValueChange={(value) => {
                    if (value.startsWith("system:")) {
                      const path = value.slice("system:".length);
                      const font = systemFonts.find((f) => f.path === path);
                      if (!font) return;
                      updateEntity({ font });
                      return;
                    }
                    if (value.startsWith("asset:")) {
                      const assetId = value.slice("asset:".length);
                      updateEntity({ font: { assetId } });
                      return;
                    }
                  }}
                >
                  <FormControl className="col-span-2">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {systemFonts.map((font) => (
                      <SelectItem
                        key={`system:${font.path}`}
                        value={`system:${font.path}`}
                      >
                        {font.family} {font.style}
                      </SelectItem>
                    ))}
                    {assets
                      .filter((a) => a.originalExtension === "json")
                      .map((asset) => (
                        <SelectItem
                          key={`asset:${asset.id}`}
                          value={`asset:${asset.id}`}
                        >
                          {asset.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </ControlRow>
            </FormItem>
            <ControlRow columns={3}>
              <FormControlNumber
                description="Font Size"
                label={<ALargeSmall />}
                step={0.01}
                min={0.01}
                max={10}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 2,
                }}
                value={entity.fontSize}
                onChange={(fontSize) =>
                  typeof fontSize === "number" && updateEntity({ fontSize })
                }
              />
              <FormControlNumber
                description="Letter Spacing"
                label={<SeparatorVertical />}
                step={0.01}
                min={-5}
                max={5}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 3,
                }}
                value={entity.letterSpacing}
                onChange={(letterSpacing) =>
                  typeof letterSpacing === "number" &&
                  updateEntity({ letterSpacing })
                }
              />

              <FormControlNumber
                description="Line Height"
                label={<SeparatorHorizontal />}
                step={0.1}
                min={0}
                max={5}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 2,
                }}
                value={entity.lineHeight}
                onChange={(lineHeight) =>
                  typeof lineHeight === "number" && updateEntity({ lineHeight })
                }
              />
            </ControlRow>
            <ControlRow columns={3}>
              <FormControlNumber
                description="Extrude"
                label={<MoveDiagonal />}
                step={0.01}
                min={0}
                max={10}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 2,
                }}
                value={entity.height}
                onChange={(height) =>
                  typeof height === "number" && updateEntity({ height })
                }
              />
              <FormControlNumber
                description="Bevel Size"
                label={<SquareRoundCorner />}
                step={0.001}
                min={0}
                max={1}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 4,
                }}
                value={entity.bevelSize}
                onChange={(bevelSize) =>
                  typeof bevelSize === "number" &&
                  updateEntity({ bevelSize, bevelThickness: bevelSize })
                }
              />
              {/* <FormControlNumber
                description="Bevel Thickness"
                label={<SeparatorHorizontal />}
                step={0.001}
                min={0}
                max={1}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 4,
                }}
                value={entity.bevelThickness}
                onChange={(bevelThickness) =>
                  typeof bevelThickness === "number" &&
                  updateEntity({ bevelThickness })
                }
              /> */}
            </ControlRow>
            <ControlRow>
              <ColorPicker
                color={entity.color}
                onColorChange={(color) => {
                  updateEntity({ color });
                }}
                label="Text Color"
              />
            </ControlRow>
          </ControlGroup>
        </>
      )}

      {isEntityModel(entity) && (
        <>
          <Separator />
          <ControlGroup>
            <ControlLabel level={2}>3D Model Properties</ControlLabel>
            <FormItem asChild>
              <ControlRow columns={3}>
                <FormLabel className="col-span-2">Play animation</FormLabel>
                <FormControl>
                  <Switch
                    onCheckedChange={(playAnimation) => {
                      updateEntity({ playAnimation });
                    }}
                    checked={entity.playAnimation}
                  />
                </FormControl>
              </ControlRow>
            </FormItem>
          </ControlGroup>
        </>
      )}

      {isEntityVideo(entity) && (
        <>
          <Separator />
          <ControlGroup>
            <ControlLabel level={2}>Video Properties</ControlLabel>
            <FormItem asChild>
              <ControlRow columns={3}>
                <FormLabel className="col-span-2">Autoplay</FormLabel>
                <FormControl>
                  <Switch
                    onCheckedChange={(autoplay) => {
                      updateEntity({ autoplay });
                    }}
                    checked={entity.autoplay}
                  />
                </FormControl>
              </ControlRow>
            </FormItem>
            <FormItem asChild>
              <ControlRow columns={3}>
                <FormLabel className="col-span-2">Muted</FormLabel>
                <FormControl>
                  <Switch
                    onCheckedChange={(muted) => {
                      updateEntity({ muted });
                    }}
                    checked={entity.muted}
                  />
                </FormControl>
              </ControlRow>
            </FormItem>
            <FormItem asChild>
              <ControlRow columns={3}>
                <FormLabel className="col-span-2">Loop</FormLabel>
                <FormControl>
                  <Switch
                    onCheckedChange={(loop) => {
                      updateEntity({ loop });
                    }}
                    checked={entity.loop}
                  />
                </FormControl>
              </ControlRow>
            </FormItem>
          </ControlGroup>
        </>
      )}

      <>
        <Separator />
        <ControlGroup>
          <ControlLabel level={2}>Float</ControlLabel>
          <FormItem asChild>
            <ControlRow columns={3}>
              <FormLabel className="col-span-2">Enable Float</FormLabel>
              <FormControl>
                <Switch
                  onCheckedChange={(enabled) => {
                    updateFloat({ enabled });
                  }}
                  checked={float?.enabled}
                />
              </FormControl>
            </ControlRow>
          </FormItem>
          {float?.enabled ? (
            <>
              <ControlRow columns={3}>
                <FormControlNumber
                  description="Intensity"
                  label={<Feather />}
                  step={0.01}
                  min={0}
                  max={20}
                  formatOptions={{
                    style: "decimal",
                    maximumFractionDigits: 2,
                  }}
                  value={float.intensity}
                  onChange={(intensity) =>
                    typeof intensity === "number" &&
                    updateFloat({ intensity, rotationIntensity: intensity })
                  }
                />

                <FormControlNumber
                  description="Speed"
                  label={<Gauge />}
                  step={0.1}
                  min={0.01}
                  max={20}
                  formatOptions={{
                    style: "decimal",
                    maximumFractionDigits: 2,
                  }}
                  value={float.speed}
                  onChange={(speed) =>
                    typeof speed === "number" && updateFloat({ speed })
                  }
                />

                <FormControlNumber
                  description="Y-Amplitude"
                  label={<MoveVertical />}
                  step={0.01}
                  min={0}
                  max={20}
                  formatOptions={{
                    style: "decimal",
                    maximumFractionDigits: 2,
                  }}
                  value={float.floatingRange[1]}
                  onChange={(value) =>
                    typeof value === "number" &&
                    updateFloat({ floatingRange: [-value, value] })
                  }
                />
              </ControlRow>
            </>
          ) : null}
        </ControlGroup>
      </>

      <>
        <Separator />
        <ControlGroup>
          <ControlLabel level={2}>Turntable</ControlLabel>
          <FormItem asChild>
            <ControlRow columns={3}>
              <FormLabel className="col-span-2">Enable Turntable</FormLabel>
              <FormControl>
                <Switch
                  onCheckedChange={(enabled) => {
                    updateTurntable({ enabled });
                  }}
                  checked={turntable?.enabled}
                />
              </FormControl>
            </ControlRow>
          </FormItem>
          {turntable?.enabled ? (
            <>
              <ControlRow columns={3}>
                <FormLabel>Axis</FormLabel>
                <FormItem asChild>
                  <Select
                    value={turntable.axis}
                    onValueChange={(axis: "x" | "y" | "z") =>
                      updateTurntable({ axis })
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="x">X</SelectItem>
                      <SelectItem value="y">Y</SelectItem>
                      <SelectItem value="z">Z</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
                <FormControlNumber
                  description="Speed"
                  label={<Gauge />}
                  step={0.1}
                  min={-20}
                  max={20}
                  formatOptions={{
                    style: "decimal",
                    maximumFractionDigits: 2,
                  }}
                  value={turntable.speed}
                  onChange={(speed) =>
                    typeof speed === "number" && updateTurntable({ speed })
                  }
                />
              </ControlRow>
            </>
          ) : null}
        </ControlGroup>
      </>

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
