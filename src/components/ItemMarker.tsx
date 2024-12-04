import { GeneratedMarker } from "@/components/GeneratedMarker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { useAppState } from "./AppState";

export function ItemMarker({ itemIndex }: { itemIndex: number }) {
  const form = useAppState();

  const item = form.watch(`items.${itemIndex}`);

  return (
    <div className="grid grid-cols-3">
      <DropzoneProvider
        multiple={false}
        accept={{ "image/*": [] }}
        preventDropOnDocument
        onDrop={(files) => {
          // set file as item.marker
          form.setValue(`items.${itemIndex}.marker`, files[0]);
        }}
      >
        <Dropzone className="group p-2 relative aspect-square col-span-1">
          {item.marker ? (
            <>
              <img
                src={URL.createObjectURL(item.marker)}
                alt=""
                className="object-contain w-full h-full"
              />
              <Badge className="absolute bottom-3 right-3 z-10">Custom</Badge>
            </>
          ) : (
            <>
              <GeneratedMarker id={item.id} />
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
      {item.marker ? (
        <Button
          size="sm"
          className="mt-2"
          onClick={() => {
            // set marker as null
            form.setValue(`items.${itemIndex}.marker`, null);
          }}
        >
          <XIcon className="size-4" />
          Remove custom marker
        </Button>
      ) : null}
    </div>
  );
}
