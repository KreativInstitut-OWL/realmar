import { useOutsideClick } from "@/hooks/useOutsideClick";
import { isMouseEvent } from "@/lib/utils";
import { useStore } from "@/store";
import * as React from "react";
import { AssetListItem, AssetListItemDragOverlay } from "./AssetListItem";
import { Sortable } from "./ui/sortable";

export function AssetList() {
  const assets = useStore((state) => state.assets);
  const moveAssets = useStore((state) => state.moveAssets);

  const [selectedAssetIds, setSelectedAssetIds] = React.useState<string[]>([]);

  const handleAssetClick = React.useCallback(
    (
      assetId: string,
      event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent
    ) => {
      const modifierPressed = event.ctrlKey || event.shiftKey || event.metaKey;

      if (!modifierPressed) {
        setSelectedAssetIds([assetId]);
        return;
      }

      setSelectedAssetIds((prev) => {
        if (prev.includes(assetId)) {
          return prev.filter((id) => id !== assetId);
        } else {
          return [...prev, assetId];
        }
      });
    },
    [setSelectedAssetIds]
  );

  const [isDragging, setIsDragging] = React.useState(false);

  const listRef = React.useRef<HTMLDivElement>(null);

  useOutsideClick(listRef, () => {
    setSelectedAssetIds([]);
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
                    if (selectedAssetIds.includes(asset.id)) return;
                    handleAssetClick(asset.id, event);
                  }}
                  isAssetSelected={selectedAssetIds.includes(asset.id)}
                  selectedAssetIds={selectedAssetIds}
                  isDragging={isDragging}
                />
              ),
              dragOverlay: (
                <AssetListItemDragOverlay
                  asset={asset}
                  assetSelectCount={selectedAssetIds.length}
                />
              ),
            }))}
            onItemMove={(_oldIndex, newIndex) => {
              moveAssets(selectedAssetIds, newIndex);
            }}
            onDragStart={(event) => {
              setIsDragging(true);

              const { active, activatorEvent } = event;
              if (!active?.id || typeof active.id !== "string") return;

              const assetId = active.id as string;

              if (selectedAssetIds.includes(assetId)) return;

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
        <div className="text-gray-11 text-sm">Add one or more entities…</div>
      )}
    </>
  );
}
