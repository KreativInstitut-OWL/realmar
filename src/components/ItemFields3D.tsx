import { AppState } from "@/schema";

import { degreesToRadians, radiansToDegrees } from "@/lib/math";
import { Move3D, Rotate3D, Scale3D } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { InputNumber } from "./ui/input-number";
import { Label } from "./ui/label";

export function ItemFields3D({ itemIndex }: { itemIndex: number }) {
  const form = useFormContext<AppState>();

  return (
    <div className="flex flex-col divide-y">
      {/* <FormField
        control={form.control}
        name={`items.${itemIndex}.lookAt`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Look At</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value ?? undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select look at option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="undefined">Undefined</SelectItem>
                <SelectItem value="camera">Camera</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Choose whether the asset should look at the camera
            </FormDescription>
          </FormItem>
        )}
      /> */}
      {["rotation", "position"].map((vectorType) => (
        <FormField
          key={vectorType}
          control={form.control}
          name={
            `items.${itemIndex}.${vectorType}` as `items.${number}.rotation`
          }
          render={() => (
            <div className="flex flex-col py-6">
              <Label className="flex gap-3 items-center text-lg">
                {vectorType === "rotation" ? (
                  <>
                    <Rotate3D className="size-4" /> Rotation
                  </>
                ) : vectorType === "position" ? (
                  <>
                    <Move3D className="size-4" /> Position
                  </>
                ) : (
                  <>
                    <Scale3D className="size-4" /> Scale
                  </>
                )}
              </Label>
              <div className="grid grid-cols-3 gap-4">
                {["x", "y", "z"].map((axis) => (
                  <FormField
                    key={axis}
                    control={form.control}
                    name={
                      `items.${itemIndex}.${vectorType}.${axis}` as `items.${number}.rotation.x`
                    }
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
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
                            onChange={(value) =>
                              field.onChange(
                                value === null
                                  ? 0
                                  : vectorType === "rotation"
                                  ? degreesToRadians(value)
                                  : value
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        />
      ))}
    </div>
  );
}
