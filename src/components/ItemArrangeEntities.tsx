import {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { useCurrentItem, useStore } from "@/store";
import { ImagePlusIcon } from "lucide-react";
import { ItemEntity, ItemEntityDragOverlay } from "./ItemEntity";
import { Sortable } from "./ui/sortable";
import * as React from "react";

export function ItemEntities() {
  const addFilesAsItemEntities = useStore(
    (state) => state.addFilesAsItemEntities
  );
  const moveItemEntities = useStore((state) => state.moveItemEntities);

  const [selectedEntityIds, setSelectedEntityIds] = React.useState<string[]>(
    []
  );

  const handleEntityClick = React.useCallback(
    (
      entityId: string,
      event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent
    ) => {
      const modifierPressed = event.ctrlKey || event.shiftKey || event.metaKey;

      if (!modifierPressed) {
        setSelectedEntityIds([entityId]);
        return;
      }

      setSelectedEntityIds((prev) => {
        if (prev.includes(entityId)) {
          return prev.filter((id) => id !== entityId);
        } else {
          return [...prev, entityId];
        }
      });
    },
    [setSelectedEntityIds]
  );

  const item = useCurrentItem();

  const [isDragging, setIsDragging] = React.useState(false);

  const listRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(listRef, () => {
    setSelectedEntityIds([]);
  });

  if (!item) return null;

  return (
    <div className="p-8">
      <DropzoneProvider
        // accept={{ "image/*": [], "model/*": [".glb"] }}
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
              Supported file types: images and 3D models (*.glb)
            </div>
          </DropzoneContent>
          <DropzoneDragAcceptContent>
            Drop entities here to add them to this marker…
          </DropzoneDragAcceptContent>
        </Dropzone>
      </DropzoneProvider>

      {item?.entities && item?.entities.length > 0 ? (
        <div className="select-none" ref={listRef}>
          <Sortable
            items={item?.entities.map((entity) => ({
              id: entity.id,
              node: (
                <ItemEntity
                  itemId={item.id}
                  entityId={entity.id}
                  onClick={(event) => handleEntityClick(entity.id, event)}
                  onContextMenu={(event) => {
                    if (selectedEntityIds.includes(entity.id)) return;
                    handleEntityClick(entity.id, event);
                  }}
                  isEntitySelected={selectedEntityIds.includes(entity.id)}
                  selectedEntityIds={selectedEntityIds}
                  isDragging={isDragging}
                />
              ),
              dragOverlay: (
                <ItemEntityDragOverlay
                  itemId={item.id}
                  entityId={entity.id}
                  entitySelectCount={selectedEntityIds.length}
                />
              ),
            }))}
            onItemMove={(oldIndex, newIndex) => {
              moveItemEntities(item.id, selectedEntityIds, newIndex);
            }}
            onDragStart={(event) => {
              setIsDragging(true);

              const { active, activatorEvent } = event;
              if (!active?.id || typeof active.id !== "string") return;

              const entityId = active.id as string;

              if (selectedEntityIds.includes(entityId)) return;

              if (isMouseEvent(activatorEvent))
                handleEntityClick(entityId, activatorEvent);
            }}
            onDragEnd={() => {
              setIsDragging(false);
            }}
            withDragHandle
          />
        </div>
      ) : (
        <div>
          <div className="text-gray-11 text-sm">
            Add one or more entities to this marker.
          </div>
        </div>
      )}
    </div>
  );
}

function isMouseEvent(event: Event): event is MouseEvent {
  return event instanceof MouseEvent;
}

function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // also ignore all clicks on the context menus ([data-radix-popper-content-wrapper])
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !document
          .querySelector("[data-radix-popper-content-wrapper]")
          ?.contains(event.target as Node)
      ) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
