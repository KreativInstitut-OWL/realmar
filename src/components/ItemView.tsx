import { ItemTabs } from "./ItemTabs";

export function ItemView({ itemHeader }: { itemHeader: HTMLLIElement | null }) {
  return (
    <div className="flex h-full w-full">
      <ItemTabs itemHeader={itemHeader} />
    </div>
  );
}
