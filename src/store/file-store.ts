import * as idb from "idb-keyval";

export const fileStore = idb.createStore("batchar-files", "files");

export async function add(id: string, file: File) {
  // const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  idb.set(id, file, fileStore);
}

export async function addAll(fileMap: Map<string, File>): Promise<void> {
  await Promise.all(
    Array.from(fileMap.entries()).map(([id, file]) => add(id, file))
  );
}

export async function get(id: string | null | undefined): Promise<File | null> {
  if (!id) return null;
  const file = await idb.get(id, fileStore);
  if (!file) return null;
  return file as File;
}

async function getAllIds(): Promise<string[]> {
  return await idb.keys(fileStore);
}

export async function getAll(): Promise<Map<string, File>> {
  const ids = await getAllIds();
  const files = await Promise.all(ids.map((key) => get(key)));

  const fileMap = new Map<string, File>();

  ids.forEach((id, index) => {
    const file = files[index];
    if (file !== null) {
      fileMap.set(id, file);
    }
  });

  return fileMap;
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
