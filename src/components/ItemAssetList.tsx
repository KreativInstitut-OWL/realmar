import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useStore, useCurrentItemAssets } from "@/store";
import { ImagePlusIcon } from "lucide-react";
import { ItemAsset } from "./ItemAsset";

export function ItemAssetList() {
  const { addItemAssets } = useStore();

  const { data: itemAssets } = useCurrentItemAssets();

  if (!itemAssets) {
    return "loading...";
  }

  return (
    <>
      {itemAssets.assets && itemAssets.assets.length > 0 ? (
        <div className=" divide-gray-100 divide-y">
          {itemAssets.assets.map((asset) => (
            <ItemAsset
              key={asset.id}
              itemId={itemAssets.id}
              assetId={asset.id}
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
        // accept={{ "image/*": [], "model/*": [".glb"] }}
        onDrop={async (files) => {
          await addItemAssets(itemAssets.id, files);
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
