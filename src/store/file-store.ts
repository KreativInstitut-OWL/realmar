import * as idb from "idb-keyval";

export const fileStore = idb.createStore("batchar-files", "files");

export async function add({ id, file }: { id: string; file: File }) {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  idb.set(id, blob, fileStore);
}

export async function addMany(items: { id: string; file: File }[]) {
  await Promise.all(items.map((item) => add(item)));
}

export async function get(id: string | null | undefined): Promise<File | null> {
  if (!id) return null;
  const blob = await idb.get(id, fileStore);
  if (!blob) return null;
  return new File([blob], id, { type: blob.type });
}

async function getAllIds(): Promise<string[]> {
  return await idb.keys(fileStore);
}

export async function getAll(): Promise<File[]> {
  const ids = await getAllIds();
  return (await Promise.all(ids.map((key) => get(key)))).filter(
    (file): file is File => file !== null
  );
}

export async function del(id: string) {
  const file = await get(id);
  if (!file) return;
  await idb.del(id, fileStore);
}

export async function clear() {
  const ids = await getAllIds();
  await Promise.all(ids.map((id) => del(id)));
}
