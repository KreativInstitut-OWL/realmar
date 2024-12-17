import { Item } from "@/store";
import slugify from "slugify";

export function getItemDefaultName(index: number) {
  return `Marker ${index + 1}`;
}

export function getItemName(item: Item, index: number) {
  return item.name ?? getItemDefaultName(index);
}

export function padStart(value: number, length: number) {
  return value.toString().padStart(length, "0");
}

export function getItemFolderName(item: Item, index: number) {
  return `${padStart(index, 4)}-${slugify(getItemName(item, index), {
    lower: true,
  })}`;
}
