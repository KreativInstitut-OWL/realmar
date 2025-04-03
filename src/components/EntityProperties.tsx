import { radiansToDegrees } from "@/lib/math";
import {
  composeMatrix4WithMatrixComponentAndComponent,
  MatrixComponent,
  QuaternionComponent,
  useDecomposeMatrix4,
  Vector3Component,
} from "@/lib/three";
import { uppercaseFirstLetter } from "@/lib/utils";
import {
  Entity,
  isEntityModel,
  isEntityText,
  isEntityVideo,
  Item,
  systemFonts,
  useStore,
} from "@/store";
import {
  ALargeSmall,
  Link2,
  MoveDiagonal,
  SeparatorHorizontal,
  SeparatorVertical,
  SquareRoundCorner,
  Unlink2,
  Video,
  VideoOff,
} from "lucide-react";
import { useCallback } from "react";
import { FormControlNumber } from "./FormControlNumber";
import { ControlGroup, ControlLabel, ControlRow } from "./ui/control";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { Input, Textarea } from "./ui/input";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Toggle } from "./ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { SelectValue } from "@radix-ui/react-select";

export function EntityProperties({
  item,
  entity,
}: {
  item: Item;
  entity: Entity;
}) {
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

  if (!item || !entity) return null;

  return (
    <div className="grid gap-4">
      <ControlGroup>
        <ControlLabel level={2}>
          {uppercaseFirstLetter(entity.type)}
        </ControlLabel>
        <FormItem asChild>
          <ControlRow columns={3}>
            <FormLabel>Name</FormLabel>
            <FormControl className="col-span-2">
              <Input
                type="text"
                value={entity.name}
                onChange={(e) => {
                  updateEntity({ name: e.target.value });
                }}
              />
            </FormControl>
          </ControlRow>
        </FormItem>
      </ControlGroup>

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
            <ControlLabel level={2}>Text</ControlLabel>
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
                  value={entity.font?.path}
                  onValueChange={(value) => {
                    const font = systemFonts.find(
                      (font) => font.path === value
                    );
                    if (!font) return;
                    updateEntity({
                      font,
                    });
                  }}
                >
                  <FormControl className="col-span-2">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {systemFonts.map((font) => (
                      <SelectItem key={font.path} value={font.path}>
                        {font.family} {font.style}
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
                step={0.1}
                min={0.1}
                max={10}
                formatOptions={{
                  style: "decimal",
                  maximumFractionDigits: 2,
                }}
                value={entity.fontSize}
                onChange={(fontSize) => fontSize && updateEntity({ fontSize })}
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
                  letterSpacing && updateEntity({ letterSpacing })
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
                  lineHeight && updateEntity({ lineHeight })
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
                onChange={(height) => height && updateEntity({ height })}
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
                  bevelSize && updateEntity({ bevelSize })
                }
              />
              <FormControlNumber
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
                  bevelThickness && updateEntity({ bevelThickness })
                }
              />
            </ControlRow>
          </ControlGroup>
        </>
      )}

      {isEntityModel(entity) && (
        <>
          <Separator />
          <ControlGroup>
            <ControlLabel level={2}>3D Model</ControlLabel>
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
            <ControlLabel level={2}>Video</ControlLabel>
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
