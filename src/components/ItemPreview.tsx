import { getItemName } from "@/lib/item";
import { useItem } from "@/store";
import { Target } from "./Target";
import { cn } from "@/lib/utils";

export function ItemPreview({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  const item = useItem(id);
  if (!item) return null;

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <Target
        itemId={item.id}
        assetId={item.targetAssetId}
        className="size-4"
      />
      <span className={cn({ "": !item.name })}>
        {getItemName(item, item?.index)}
      </span>
      {children}
    </div>
  );
}
