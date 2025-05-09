import { useOutsideClick } from "@/hooks/useOutsideClick";
import { isMouseEvent } from "@/lib/utils";
import { useStore } from "@/store";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";
import { AssetListItem, AssetListItemDragOverlay } from "./AssetListItem";
import { Sortable } from "./ui/sortable";

export function AssetList({
  selectedIds: selectedIdsProp,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  resetOnOutsideClick = false,
}: {
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (selectedIds: string[]) => void;
  resetOnOutsideClick?: boolean;
}) {
  const assets = useStore((state) => state.assets);
  const moveAssets = useStore((state) => state.moveAssets);

  const [selectedIds = [], setSelectedIds] = useControllableState<string[]>({
    prop: selectedIdsProp,
    defaultProp: defaultSelectedIds,
    onChange: onSelectedIdsChange,
  });

  const handleAssetClick = React.useCallback(
    (
      assetId: string,
      event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent
    ) => {
      const modifierPressed = event.ctrlKey || event.shiftKey || event.metaKey;

      if (!modifierPressed) {
        setSelectedIds([assetId]);
        return;
      }

      setSelectedIds((prev = []) => {
        if (prev.includes(assetId)) {
          return prev.filter((id) => id !== assetId);
        } else {
          return [...prev, assetId];
        }
      });
    },
    [setSelectedIds]
  );

  const [isDragging, setIsDragging] = React.useState(false);

  const listRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(listRef, () => {
    if (resetOnOutsideClick) setSelectedIds([]);
  });

  return (
    <>
      {assets.length > 0 ? (
        <div className="select-none" ref={listRef}>
          <Sortable
            items={assets.map((asset, index) => ({
              id: asset.id,
              node: (
                <AssetListItem
                  asset={asset}
                  assetIndex={index}
                  onClick={(event) => handleAssetClick(asset.id, event)}
                  onContextMenu={(event) => {
                    if (selectedIds.includes(asset.id)) return;
                    handleAssetClick(asset.id, event);
                  }}
                  isSelected={selectedIds.includes(asset.id)}
                  selectedIds={selectedIds}
                  isDragging={isDragging}
                />
              ),
              dragOverlay: (
                <AssetListItemDragOverlay
                  asset={asset}
                  assetSelectCount={selectedIds.length}
                />
              ),
            }))}
            onItemMove={(_oldIndex, newIndex) => {
              moveAssets(selectedIds, newIndex);
            }}
            onDragStart={(event) => {
              setIsDragging(true);

              const { active, activatorEvent } = event;
              if (!active?.id || typeof active.id !== "string") return;

              const assetId = active.id as string;

              if (selectedIds.includes(assetId)) return;

              if (isMouseEvent(activatorEvent))
                handleAssetClick(assetId, activatorEvent);
            }}
            onDragEnd={() => {
              setIsDragging(false);
            }}
            withDragHandle
          />
        </div>
      ) : (
        <div className="w-full bg-gray-1 h-9 flex items-center justify-center">
          <div className="text-gray-11 text-sm text-center">
            Add assets to your project by dragging them to the dropzone above or
            by clicking it to select files.
          </div>
        </div>
      )}
    </>
  );
}
