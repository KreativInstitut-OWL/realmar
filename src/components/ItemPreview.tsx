import { getItemName } from "@/lib/item";
import { useItem } from "@/store";
import { Target } from "./Target";

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
    <div className="inline-flex items-center gap-2">
      <Target
        itemId={item.id}
        assetId={item.targetAssetId}
        className="size-4"
      />
      {getItemName(item, item?.index)}
      {children}
    </div>
  );
}
