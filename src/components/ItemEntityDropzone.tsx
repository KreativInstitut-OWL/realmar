import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useCurrentItem, useStore } from "@/store";
import { ImagePlusIcon } from "lucide-react";

export function ItemEntityDropzone() {
  const addFilesAsItemEntities = useStore(
    (state) => state.addFilesAsItemEntities
  );

  const item = useCurrentItem();

  if (!item) return null;

  return (
    <DropzoneProvider
      onDrop={async (files) => {
        await addFilesAsItemEntities(item.id, files);
      }}
    >
      <Dropzone className="group p-8 mb-12">
        <DropzoneContent>
          <ImagePlusIcon className="size-5 mb-4" />
          <div>
            Add one or more entities to this marker by dropping them here or
            click to select files.
          </div>
          <div className="text-gray-11">
            Supported file types: images, videos and 3D models (*.glb)
          </div>
        </DropzoneContent>
        <DropzoneDragAcceptContent>
          Drop entities here to add them to this marker…
        </DropzoneDragAcceptContent>
      </Dropzone>
    </DropzoneProvider>
  );
}
