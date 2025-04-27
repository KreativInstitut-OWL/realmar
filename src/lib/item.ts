import { Item } from "@/store";
import slugify from "slugify";

export function getItemDefaultName(index: number) {
  return `Marker ${index + 1}`;
}

export function getItemName(item: Item, index: number) {
  return item.name ?? getItemDefaultName(index);
}

export function autoPadStart(value: number, count: number) {
  const length = Math.ceil(Math.log10(count + 1));
  return value.toString().padStart(length, "0");
}

export function getItemFolderName(item: Item, index: number, count: number) {
  return `${autoPadStart(index + 1, count)}-${slugify(
    getItemName(item, index),
    {
      lower: true,
    }
  )}`;
}
