import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useCurrentItem, useStore } from "@/store";
import { ImagePlusIcon } from "lucide-react";
import { ItemEntity } from "./ItemEntity";
import { Sortable } from "./ui/sortable";

export function ItemEntities() {
  const addItemEntities = useStore((state) => state.addItemEntities);
  const moveItemEntity = useStore((state) => state.moveItemEntity);

  const item = useCurrentItem();

  if (!item) return null;

  return (
    <>
      {item?.entities && item?.entities.length > 0 ? (
        <div className=" divide-gray-100 divide-y">
          <Sortable
            items={item?.entities.map((entity) => ({
              id: entity.id,
              node: (
                <ItemEntity
                  key={entity.id}
                  itemId={item.id}
                  entityId={entity.id}
                />
              ),
            }))}
            onItemMove={(oldIndex, newIndex) => {
              moveItemEntity(item.id, oldIndex, newIndex);
            }}
            withDragHandle
          />
        </div>
      ) : (
        <div>
          <div className="text-gray-400 text-sm">
            Add one or more entities to this marker.
          </div>
        </div>
      )}
      <DropzoneProvider
        // accept={{ "image/*": [], "model/*": [".glb"] }}
        onDrop={async (files) => {
          await addItemEntities(item.id, files);
        }}
      >
        <Dropzone className="group p-8 mt-12">
          <DropzoneContent>
            <ImagePlusIcon className="size-5 mb-4" />
            <div>
              Add one or more entities to this marker by dropping them here or
              click to select files.
            </div>
            <div className="text-gray-400">
              Supported file types: images and 3D models (*.glb)
            </div>
          </DropzoneContent>
          <DropzoneDragAcceptContent>
            Drop entities here to add them to this marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>
    </>
  );
}
