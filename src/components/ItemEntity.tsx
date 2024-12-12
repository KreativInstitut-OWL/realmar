import { byteFormatter } from "@/lib/utils";
import { useAsset, useItem, useStore } from "@/store";
import { FileIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "./ui/button";

export function ItemEntity({
  itemId,
  entityId,
}: {
  itemId: string;
  entityId: string;
}) {
  const removeItemEntity = useStore((state) => state.removeItemEntity);
  const item = useItem(itemId);

  const entity = useMemo(() => {
    return item?.entities.find((entity) => entity.id === entityId);
  }, [item, entityId]);

  const { data: entityAsset } = useAsset(entity?.assetId);

  if (!entity || !entityAsset) return null;

  return (
    <div className="flex gap-4 items-center">
      <div className="size-20 grid place-items-center *:drop-shadow-md">
        {entityAsset.file.type.startsWith("image/") && (
          <img
            src={entityAsset.src}
            alt=""
            className="size-16 object-contain"
          />
        )}
        {!entityAsset.file.type.startsWith("image/") && (
          <FileIcon className="size-8" />
        )}
      </div>
      <div>
        {entityAsset.file.name}{" "}
        <span className="text-gray-400">
          ({byteFormatter.format(entityAsset.file.size)})
        </span>
      </div>
      <div className="flex gap-2 ml-auto">
        <Button
          variant="outline"
          size="icon"
          aria-label="Remove entity"
          onClick={() => {
            removeItemEntity(itemId, entityId);
          }}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
