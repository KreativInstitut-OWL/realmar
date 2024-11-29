import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { AppState, assetSchema } from "@/schema";
import { ImagePlusIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ItemAssetFields } from "./ItemAssetFields";

export function ItemAssetFieldArray({ itemIndex }: { itemIndex: number }) {
  const form = useFormContext<AppState>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `items.${itemIndex}.assets`,
  });

  return (
    <>
      {fields.length > 0 ? (
        <div className=" divide-gray-100 divide-y">
          {fields.map((asset, assetIndex) => (
            <ItemAssetFields
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
        onDrop={(files) => {
          append(files.map((file) => assetSchema.parse({ file })));
        }}
      >
        <Dropzone className="group p-2 mt-12">
          <DropzoneContent>
            <ImagePlusIcon className="size-5 mr-6" />
            Add one or more assets to this marker by dropping them here.
            <br />
            You can also click to select files.
          </DropzoneContent>
          <DropzoneDragAcceptContent>
            Drop assets here to add them to this marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
    </>
  );
}
