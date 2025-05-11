import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn, isMouseEvent } from "@/lib/utils";
import { useStore } from "@/store";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as React from "react";
import { AssetListItem, AssetListItemDragOverlay } from "./AssetListItem";
import { Sortable } from "./ui/sortable";
import { Input } from "./ui/input";
import Fuse from "fuse.js";

export function AssetList({
  selectedIds: selectedIdsProp,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  resetOnOutsideClick = false,
  className,
}: {
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (selectedIds: string[]) => void;
  resetOnOutsideClick?: boolean;
  className?: string;
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

  const [filterValue, setFilterValue] = React.useState("");

  const deferredFilterValue = React.useDeferredValue(filterValue);

  const assetFuse = React.useMemo(() => {
    return new Fuse(assets, {
      keys: ["name", "type", "originalBasename", "originalExtension"],
      threshold: 0.4, // Adjust threshold as needed (lower = more strict matching)
    });
  }, [assets]);

  const filteredAssets = React.useMemo(() => {
    if (deferredFilterValue === "") return [];

    // Perform the search and extract the items
    return assetFuse.search(deferredFilterValue).map((result) => result);
  }, [assetFuse, deferredFilterValue]);

  return assets.length > 0 ? (
    <div>
      <Input
        type="search"
        placeholder="Search assets…"
        className="mb-2 w-64"
        value={filterValue}
        onChange={(event) => {
          setFilterValue(event.target.value);
        }}
      />
      {filterValue === "" ? (
        <div className={cn("select-none", className)} ref={listRef}>
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
      ) : filteredAssets.length ? (
        <div className={cn("select-none", className)}>
          {filteredAssets.map(({ item: asset }, index) => (
            <AssetListItem
              key={asset.id}
              asset={asset}
              assetIndex={index}
              onClick={(event) => handleAssetClick(asset.id, event)}
              onContextMenu={(event) => {
                if (selectedIds.includes(asset.id)) return;
                handleAssetClick(asset.id, event);
              }}
              isSelected={selectedIds.includes(asset.id)}
              selectedIds={selectedIds}
              isDraggable={false}
            />
          ))}
        </div>
      ) : (
        <div className={cn(className)}>
          <div className="w-full bg-gray-1 h-9 flex items-center justify-center">
            <div className="text-gray-11 text-sm text-center">
              No assets found matching your search.
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className={cn(className)}>
      <div className="w-full bg-gray-1 h-9 flex items-center justify-center">
        <div className="text-gray-11 text-sm text-center">
          Add assets to your project by dragging them to the dropzone above or
          by clicking it to select files.
        </div>
      </div>
    </div>
  );
}
