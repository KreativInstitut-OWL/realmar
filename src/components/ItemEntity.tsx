import { byteFormatter, cn, dateFormatter } from "@/lib/utils";
import { Asset, useAsset, useItem } from "@/store";
import { FileAxis3d, FileIcon, FileVideo, GripHorizontal } from "lucide-react";
import { forwardRef, useMemo } from "react";
import { ItemEntityContextMenu } from "./ItemEntityContextMenu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DragHandle } from "./ui/sortable";

export const ItemEntity = forwardRef<
  HTMLDivElement,
  {
    itemId: string;
    entityId: string;
    isEntitySelected: boolean;
    selectedEntityIds: string[];
    isDragging: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      itemId,
      entityId,
      className,
      onClick,
      isEntitySelected,
      selectedEntityIds,
      isDragging,
      ...rest
    },
    ref
  ) => {
    const item = useItem(itemId);

    const entityIndex = useMemo(() => {
      return item?.entities.findIndex((entity) => entity.id === entityId);
    }, [item?.entities, entityId]);

    const entity = useMemo(() => {
      return item?.entities.find((entity) => entity.id === entityId);
    }, [item?.entities, entityId]);

    const { data: entityAsset } = useAsset(entity?.assetId);

    if (!item || !entity || !entityAsset || entityIndex === -1) return null;

    return (
      <ItemEntityContextMenu
        item={item}
        entity={entity}
        entityIndex={entityIndex!}
        selectedEntityIds={selectedEntityIds}
        asChild
      >
        <div
          className={cn(
            "flex gap-4 items-center h-14 bg-white even:bg-gray-50 px-4 transition-colors",
            {
              "bg-blue-100 even:bg-blue-100": isEntitySelected,
            },
            className,
            { invisible: isDragging && isEntitySelected }
          )}
          ref={ref}
          onClick={onClick}
          {...rest}
        >
          <DragHandle>
            <Button variant="ghost" size="icon-sm" aria-label="Drag entity">
              <GripHorizontal />
            </Button>
          </DragHandle>
          <div className="size-8 grid place-items-center">
            <AssetTypeIcon asset={entityAsset} />
          </div>
          <div className="grow min-w-0 truncate">{entityAsset.file.name}</div>{" "}
          <div className="w-24 truncate text-gray-600">
            {getAssetTypeName(entityAsset)}
          </div>
          <div className="w-24 truncate text-gray-600">
            {byteFormatter.format(entityAsset.file.size)}
          </div>
          <div className="w-42 truncate text-gray-600 text-right">
            {dateFormatter.format(entityAsset.updatedAt)}
          </div>
        </div>
      </ItemEntityContextMenu>
    );
  }
);

export const ItemEntityDragOverlay = forwardRef<
  HTMLDivElement,
  {
    itemId: string;
    entityId: string;
    entitySelectCount: number;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ itemId, entityId, className, entitySelectCount, ...rest }, ref) => {
  const item = useItem(itemId);

  const entity = useMemo(() => {
    return item?.entities.find((entity) => entity.id === entityId);
  }, [item?.entities, entityId]);

  const { data: entityAsset } = useAsset(entity?.assetId);

  if (!item || !entity || !entityAsset) return null;

  return (
    <div
      className={cn(
        "flex gap-4 items-center h-14 w-full bg-blue-100 px-4 cursor-grabbing",
        className
      )}
      ref={ref}
      {...rest}
    >
      <Button variant="ghost" size="icon-sm" disabled>
        <GripHorizontal />
      </Button>
      <div className="size-8 grid place-items-center">
        <AssetTypeIcon asset={entityAsset} />
      </div>
      <div className="min-w-0 truncate">{entityAsset.file.name}</div>
      {entitySelectCount > 1 ? <Badge>+{entitySelectCount - 1}</Badge> : null}
    </div>
  );
});

function AssetTypeIcon({ asset }: { asset: Asset }) {
  if (asset.file.type.startsWith("image/")) {
    return <img src={asset.src} alt="" className="size-8 object-contain" />;
  }

  if (asset.file.type.startsWith("model/")) {
    return <FileAxis3d className="size-5" />;
  }

  if (asset.file.type.startsWith("video/")) {
    return <FileVideo className="size-5" />;
  }

  return <FileIcon className="size-5" />;
}

function getAssetTypeName(asset: Asset) {
  if (asset.file.type.startsWith("image/")) {
    return "Image";
  }

  if (asset.file.type.startsWith("model/")) {
    return "3D Model";
  }

  if (asset.file.type.startsWith("video/")) {
    return "Video";
  }

  return "File";
}
