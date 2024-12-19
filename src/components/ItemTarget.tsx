import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useAsset, useCurrentItem, useStore } from "@/store";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Target } from "./Target";
import { FormDescription, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { getItemDefaultName } from "@/lib/item";

export function ItemTarget() {
  const item = useCurrentItem();
  const setItem = useStore((state) => state.setItem);
  const setItemTarget = useStore((state) => state.setItemTarget);
  const removeItemTarget = useStore((state) => state.removeItemTarget);

  const { data: targetAsset } = useAsset(item?.targetAssetId);

  if (!item) return null;

  return (
    <div className="grid grid-cols-3">
      <DropzoneProvider
        multiple={false}
        accept={{ "image/*": [] }}
        preventDropOnDocument
        onDrop={(files) => {
          setItemTarget(item.id, files[0]);
        }}
      >
        <Dropzone className="group p-2 relative aspect-square col-span-1">
          <Target assetId={item.targetAssetId} itemId={item.id} />
          <div className="absolute rounded-full p-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlusIcon className="size-5" />
          </div>
          <DropzoneDragAcceptContent className="grid aspect-square place-items-center absolute inset-0 bg-white/70 backdrop-blur-sm">
            Replace marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
      {targetAsset ? (
        <Button
          size="sm"
          className="mt-2"
          onClick={() => {
            removeItemTarget(item.id);
          }}
        >
          <XIcon className="size-4" />
          Remove custom target
        </Button>
      ) : null}
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormDescription>Optional name for the marker.</FormDescription>
        <Input
          onChange={(event) => {
            setItem(item.id, {
              name: event.target.value || null,
            });
          }}
          value={item.name || ""}
          placeholder={getItemDefaultName(item.index)}
        />
      </FormItem>
    </div>
  );
}
