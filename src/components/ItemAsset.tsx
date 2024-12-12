import { byteFormatter } from "@/lib/utils";
import { useStore, useItemAssetData } from "@/store";
import { FileIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "./ui/button";

export function ItemAsset({
  itemId,
  assetId,
}: {
  itemId: string;
  assetId: string;
}) {
  const { removeItemAsset } = useStore();

  const { data: item } = useItemAssetData(itemId);
  const asset = useMemo(() => {
    return item?.assets.find((asset) => asset.id === assetId);
  }, [item, assetId]);

  if (!asset?.file || !asset.src) {
    return (
      <div>
        Something is wrong with this asset. Please remove it and re-add it.
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="size-20 grid place-items-center *:drop-shadow-md">
        {asset.file.type.startsWith("image/") && (
          <img src={asset.src} alt="" className="size-16 object-contain" />
        )}
        {!asset.file.type.startsWith("image/") && (
          <FileIcon className="size-8" />
        )}
      </div>
      <div>
        {asset.file.name}{" "}
        <span className="text-gray-400">
          ({byteFormatter.format(asset.file.size)})
        </span>
      </div>
      <div className="flex gap-2 ml-auto">
        <Button
          variant="outline"
          size="icon"
          aria-label="Remove asset"
          onClick={() => {
            removeItemAsset(itemId, assetId);
          }}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
