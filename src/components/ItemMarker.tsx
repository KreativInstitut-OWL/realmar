import { GeneratedMarker } from "@/components/GeneratedMarker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { useStore, useCurrentItemAssets } from "@/store";

export function ItemMarker() {
  const { data: itemAssets } = useCurrentItemAssets();
  const setItemMarker = useStore((state) => state.setItemMarker);
  const removeItemMarker = useStore((state) => state.removeItemMarker);
  if (!itemAssets) return null;

  return (
    <div className="grid grid-cols-3">
      <DropzoneProvider
        multiple={false}
        accept={{ "image/*": [] }}
        preventDropOnDocument
        onDrop={(files) => {
          // set file as item.marker
          setItemMarker(itemAssets.id, files[0]);
        }}
      >
        <Dropzone className="group p-2 relative aspect-square col-span-1">
          {itemAssets.marker?.src ? (
            <>
              <img
                src={itemAssets.marker.src}
                alt=""
                className="object-contain w-full h-full"
              />
              <Badge className="absolute bottom-3 right-3 z-10">Custom</Badge>
            </>
          ) : (
            <>
              <GeneratedMarker id={itemAssets.id} />
              <Badge className="absolute bottom-3 right-3 z-10">Auto</Badge>
            </>
          )}
          <div className="absolute rounded-full p-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <ImagePlusIcon className="size-5" />
          </div>
          <DropzoneDragAcceptContent className="grid aspect-square place-items-center absolute inset-0 bg-white/70 backdrop-blur-sm">
            Replace marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
      {itemAssets.marker ? (
        <Button
          size="sm"
          className="mt-2"
          onClick={() => {
            removeItemMarker(itemAssets.id);
          }}
        >
          <XIcon className="size-4" />
          Remove custom marker
        </Button>
      ) : null}
    </div>
  );
}
