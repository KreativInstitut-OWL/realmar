import { AppState } from "@/schema";

import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";

export function ItemFields3D({ itemIndex }: { itemIndex: number }) {
  const form = useFormContext<AppState>();

  const item = form.watch(`items.${itemIndex}`);

  return (
    <div className="flex flex-col gap-6">
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
            <FormItem>
              <FormLabel>
                {vectorType.charAt(0).toUpperCase() + vectorType.slice(1)}
              </FormLabel>
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
                        <FormLabel className="sr-only">{`${vectorType} ${axis}`}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={axis.toUpperCase()}
                            step={0.1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number.parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
