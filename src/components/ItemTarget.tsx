import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useAsset, useCurrentItem, useStore } from "@/store";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Target } from "./Target";

export function ItemTarget() {
  const item = useCurrentItem();
  const setItemTargetFromFile = useStore(
    (state) => state.setItemTargetFromFile
  );
  const removeItemTarget = useStore((state) => state.removeItemTarget);

  const asset = useAsset(item?.targetAssetId);

  if (!item) return null;

  return (
    <div className="max-w-[512px] p-2">
      <DropzoneProvider
        multiple={false}
        accept={{ "image/*": [] }}
        preventDropOnDocument
        onDrop={(files) => {
          setItemTargetFromFile(item.id, files[0]);
        }}
      >
        <Dropzone className="group p-2 relative aspect-square col-span-1">
          <Target assetId={item.targetAssetId} itemId={item.id} />
          <div className="absolute rounded-full p-2 bg-lime-9 opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlusIcon className="size-5" />
          </div>
          <DropzoneDragAcceptContent className="grid aspect-square place-items-center absolute inset-0 bg-gray-1/70 backdrop-blur-xs">
            Replace marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
      {asset ? (
        <Button
          size="sm"
          className="mt-2"
          variant="secondary"
          onClick={() => {
            removeItemTarget(item.id);
          }}
        >
          <XIcon className="size-4" />
          Remove {asset.originalBasename}.{asset.originalExtension} as marker
        </Button>
      ) : null}
    </div>
  );
}
