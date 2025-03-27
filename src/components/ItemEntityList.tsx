import { useCurrentItem, useStore } from "@/store";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";
import { ItemEntity, ItemEntityDragOverlay } from "./ItemEntity";
import { Sortable } from "./ui/sortable";
import { cn } from "@/lib/utils";

export function ItemEntityList({
  selectedEntityIds: selectedEntityIdsProp,
  defaultSelectedEntityIds = [],
  onSelectedEntityIdsChange,
  canSelectMultipleEntities = true,
  clearSelectedEntitiesOnOutsideClick = true,
  variant,
  className,
}: {
  selectedEntityIds?: string[];
  defaultSelectedEntityIds?: string[];
  onSelectedEntityIdsChange?: (selectedEntityIds: string[]) => void;
  canSelectMultipleEntities?: boolean;
  clearSelectedEntitiesOnOutsideClick?: boolean;
  variant?: React.ComponentProps<typeof ItemEntity>["variant"];
  className?: string;
}) {
  const moveItemEntities = useStore((state) => state.moveItemEntities);

  const [selectedEntityIds = [], setSelectedEntityIds] = useControllableState({
    prop: selectedEntityIdsProp,
    defaultProp: defaultSelectedEntityIds,
    onChange: onSelectedEntityIdsChange,
  });

  const handleEntityClick = React.useCallback(
    (
      entityId: string,
      event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent
    ) => {
      const modifierPressed = event.ctrlKey || event.shiftKey || event.metaKey;

      if (!modifierPressed || !canSelectMultipleEntities) {
        setSelectedEntityIds([entityId]);
        return;
      }

      setSelectedEntityIds((prev = []) => {
        if (prev.includes(entityId)) {
          return prev.filter((id) => id !== entityId);
        } else {
          return [...prev, entityId];
        }
      });
    },
    [canSelectMultipleEntities, setSelectedEntityIds]
  );

  const item = useCurrentItem();

  const [isDragging, setIsDragging] = React.useState(false);

  const listRef = React.useRef<HTMLDivElement>(null);

  const handleOutsideClick = React.useCallback(() => {
    if (clearSelectedEntitiesOnOutsideClick) {
      setSelectedEntityIds([]);
    }
  }, [clearSelectedEntitiesOnOutsideClick, setSelectedEntityIds]);

  useOutsideClick(listRef, handleOutsideClick);

  if (!item) return null;

  return item?.entities && item?.entities.length > 0 ? (
    <div className={cn("select-none", className)} ref={listRef}>
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
              variant={variant}
            />
          ),
          dragOverlay: (
            <ItemEntityDragOverlay
              itemId={item.id}
              entityId={entity.id}
              entitySelectCount={selectedEntityIds.length}
              variant={variant}
            />
          ),
        }))}
        onItemMove={(_oldIndex, newIndex) => {
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
      <div className="text-gray-400 text-sm">
        Add one or more entities to this marker.
      </div>
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
