import * as idb from "idb-keyval";
import { Asset, createAsset } from ".";
import { queryClient } from "./query-client";

export const fileStore = idb.createStore("batchar-files", "files");

export async function add({ file, id }: Asset) {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  idb.set(id, blob, fileStore);
  const now = new Date();
  idb.set(
    `${id}.meta`,
    { name: file.name, createdAt: now, updatedAt: now },
    fileStore
  );
}

export async function addMany(assets: Asset[]) {
  await Promise.all(assets.map(add));
}

export async function get(
  id: string | null | undefined
): Promise<Asset | null> {
  if (!id) return null;
  const blob = await idb.get(id, fileStore);
  if (!blob) return null;
  const meta = await idb.get(`${id}.meta`, fileStore);
  const file = new File([blob], meta?.name, { type: blob.type });
  return createAsset({
    id,
    file,
    createdAt: meta?.createdAt,
    updatedAt: meta?.updatedAt,
  });
}

export async function rename(id: string, name: string) {
  const asset = await get(id);
  if (!asset) return;
  const blob = new Blob([await asset.file.arrayBuffer()], {
    type: asset.file.type,
  });
  idb.set(id, blob, fileStore);

  const now = new Date();

  idb.set(
    `${id}.meta`,
    { name, createdAt: asset.createdAt, updatedAt: now },
    fileStore
  );

  queryClient.setQueryData(["asset", id], {
    ...asset,
    file: new File([blob], name, { type: asset.file.type }),
    updatedAt: now,
  });
}

async function getAllIds(): Promise<string[]> {
  return (await idb.keys(fileStore)).filter((key): key is string => {
    return typeof key === "string" && !key.endsWith(".meta");
  });
}

export async function getAll(): Promise<Asset[]> {
  const ids = await getAllIds();
  return (await Promise.all(ids.map((key) => get(key)))).filter(
    (asset): asset is Asset => asset !== null
  );
}

export async function del(id: string) {
  const asset = await get(id);
  if (!asset) return;
  URL.revokeObjectURL(asset.src);

  await idb.del(`${id}.meta`, fileStore);
  await idb.del(id, fileStore);
  await queryClient.setQueryData(["asset", id], null);
}

export async function clear() {
  const ids = await getAllIds();
  await Promise.all(ids.map((id) => del(id)));
}
