import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  faceCamera: z.boolean(),
  rotation: z.number().min(0).max(360),
  spacing: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export function AssetMetaForm() {
  const [formData, setFormData] = useState<FormValues>({
    faceCamera: false,
    rotation: 0,
    spacing: 50,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  function onSubmit(data: FormValues) {
    setFormData(data);
    console.log(data);
  }

  return (
    <div className="@container">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 @4xl:grid-cols-3 gap-12 items-center"
        >
          <FormField
            control={form.control}
            name="faceCamera"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Face Camera / Look at Camera</FormLabel>
                  <FormDescription>
                    Enable this to make the asset always face the camera
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rotation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rotation</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={360}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  Adjust the rotation: {field.value}°
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="spacing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spacing</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  Adjust the spacing: {field.value}%
                </FormDescription>
              </FormItem>
            )}
          />
          <div className="col-span-full">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
