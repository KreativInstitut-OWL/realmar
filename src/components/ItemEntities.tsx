import { ItemEntityDropzone } from "./ItemEntityDropzone";
import { ItemEntityList } from "./ItemEntityList";

export function ItemEntities() {
  return (
    <div className="p-8">
      <ItemEntityDropzone />
      <ItemEntityList />
    </div>
  );
}
