import * as idb from "idb-keyval";
import { Asset, createAsset } from ".";
import { queryClient } from "./query-client";

const fileStore = idb.createStore("batchar-files", "files");

export async function add({ file, id }: Asset) {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  idb.set(id, blob, fileStore);
  idb.set(`${id}.meta`, { name: file.name }, fileStore);
}

export async function get(
  id: string | null | undefined
): Promise<Asset | null> {
  if (!id) return null;
  const blob = await idb.get(id, fileStore);
  if (!blob) return null;
  const meta = await idb.get(`${id}.meta`, fileStore);
  const file = new File([blob], meta.name, { type: blob.type });
  return createAsset({ id, file });
}

export async function del(id: string) {
  await idb.del(`${id}.meta`, fileStore);
  await idb.del(id, fileStore);
  await queryClient.setQueryData(["asset", id], null);
}
