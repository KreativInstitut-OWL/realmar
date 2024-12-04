import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { assetSchema } from "@/schema";
import { ImagePlusIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { useAppState } from "./AppState";
import { ItemAsset } from "./ItemAsset";

export function ItemAssetList({ itemIndex }: { itemIndex: number }) {
  const form = useAppState();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `items.${itemIndex}.assets`,
  });

  return (
    <>
      {fields.length > 0 ? (
        <div className=" divide-gray-100 divide-y">
          {fields.map((asset, assetIndex) => (
            <ItemAsset
              key={asset.id}
              itemIndex={itemIndex}
              assetIndex={assetIndex}
              onRemove={() => {
                remove(assetIndex);
              }}
            />
          ))}
        </div>
      ) : (
        <div>
          <div className="text-gray-400 text-sm">
            Add one or more assets to this marker.
          </div>
        </div>
      )}
      <DropzoneProvider
        accept={{ "image/*": [], "model/*": [".glb"] }}
        onDrop={(files) => {
          append(files.map((file) => assetSchema.parse({ file })));
        }}
      >
        <Dropzone className="group p-8 mt-12">
          <DropzoneContent>
            <ImagePlusIcon className="size-5 mb-4" />
            <div>
              Add one or more assets to this marker by dropping them here or
              click to select files.
            </div>
            <div className="text-gray-400">
              Supported file types: images and 3D models (*.glb)
            </div>
          </DropzoneContent>
          <DropzoneDragAcceptContent>
            Drop assets here to add them to this marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
    </>
  );
}
