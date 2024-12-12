import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useStore, useCurrentItemAssetData } from "@/store";
import { ImagePlusIcon } from "lucide-react";
import { ItemAsset } from "./ItemAsset";

export function ItemAssetList() {
  const { addItemAssets } = useStore();

  const { data } = useCurrentItemAssetData();

  if (!data) {
    return "loading...";
  }

  return (
    <>
      {data.assets && data.assets.length > 0 ? (
        <div className=" divide-gray-100 divide-y">
          {data.assets.map((asset) => (
            <ItemAsset key={asset.id} itemId={data.id} assetId={asset.id} />
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
          await addItemAssets(data.id, files);
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
