import { degreesToRadians, radiansToDegrees } from "@/lib/math";
import { RotateCcw } from "lucide-react";
import { useAppState } from "./AppState";
import { Button } from "./ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { InputNumber } from "./ui/input-number";
import { Switch } from "./ui/switch";

export function ItemArrangeControls({ itemIndex }: { itemIndex: number }) {
  const form = useAppState();

  const lookAt = form.watch(`items.${itemIndex}.lookAt`);

  return (
    <div className="grid grid-cols-1 gap-8 bg-white p-4">
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
                form.setValue(
                  `items.${itemIndex}.${vectorType}.x` as `items.${number}.rotation.x`,
                  vectorType === "scale" ? 1 : 0
                );
                form.setValue(
                  `items.${itemIndex}.${vectorType}.y` as `items.${number}.rotation.y`,
                  vectorType === "scale" ? 1 : 0
                );
                form.setValue(
                  `items.${itemIndex}.${vectorType}.z` as `items.${number}.rotation.z`,
                  vectorType === "scale" ? 1 : 0
                );
              }}
            >
              <RotateCcw />
            </Button>
            {vectorType === "rotation" && (
              <FormField
                control={form.control}
                name={`items.${itemIndex}.lookAt`}
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center space-y-0 ml-auto">
                    <FormLabel>Look at camera</FormLabel>
                    <Switch
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? "camera" : undefined);
                      }}
                      checked={field.value === "camera"}
                    />
                  </FormItem>
                )}
              />
            )}
            {vectorType === "scale" && (
              <FormField
                control={form.control}
                name={`items.${itemIndex}.isUniformScale`}
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center space-y-0 ml-auto">
                    <FormLabel>Uniform</FormLabel>
                    <Switch
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                      checked={field.value}
                    />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["x", "y", "z"].map((axis) => (
              <FormField
                key={axis}
                control={form.control}
                name={
                  `items.${itemIndex}.${vectorType}.${axis}` as `items.${number}.rotation.x`
                }
                disabled={lookAt === "camera" && vectorType === "rotation"}
                render={({ field }) => (
                  <FormItem className="flex space-y-0 gap-2 items-center">
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
                        {...field}
                        value={
                          vectorType === "rotation"
                            ? radiansToDegrees(field.value)
                            : field.value
                        }
                        onChange={(value) => {
                          if (
                            vectorType === "scale" &&
                            form.getValues(
                              `items.${itemIndex}.isUniformScale`
                            ) &&
                            value !== null
                          ) {
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

                          return field.onChange(
                            value === null
                              ? 0
                              : vectorType === "rotation"
                              ? degreesToRadians(value)
                              : value
                          );
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      ))}
      <FormField
        control={form.control}
        name={`items.${itemIndex}.shouldPlayAnimation`}
        render={({ field }) => (
          <FormItem className="flex gap-2 items-center space-y-0 w-full">
            <div className="space-y-0.5">
              <FormLabel>Play Animation</FormLabel>
              <FormDescription>If available in 3D model</FormDescription>
            </div>
            <Switch
              className="ml-auto"
              onCheckedChange={(checked) => {
                field.onChange(checked);
              }}
              checked={field.value}
            />
          </FormItem>
        )}
      />
    </div>
  );
}
