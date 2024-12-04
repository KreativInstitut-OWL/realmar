import { byteFormatter } from "@/lib/utils";
import { FileIcon, Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { useAppState } from "./AppState";

export function ItemAsset({
  itemIndex,
  assetIndex,
  onRemove,
}: {
  assetIndex: number;
  itemIndex: number;
  onRemove: () => void;
}) {
  const form = useAppState();

  const asset = form.watch(`items.${itemIndex}.assets.${assetIndex}`);

  const src = useMemo(() => URL.createObjectURL(asset.file), [asset.file]);

  return (
    <div className="flex gap-4 items-center">
      <div className="size-20 grid place-items-center *:drop-shadow-md">
        {asset.file.type.startsWith("image/") && (
          <img src={src} alt="" className="size-16 object-contain" />
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
            onRemove();
          }}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
