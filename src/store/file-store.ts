import * as idb from "idb-keyval";

const fileStore = idb.createStore("file-store", "file-store");

export async function add(id: string, file: File) {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  idb.set(id, blob, fileStore);
  idb.set(`${id}-name`, file.name, fileStore);
}

export async function get(id: string) {
  const blob = await idb.get(id, fileStore);
  if (!blob) return null;
  const name = await idb.get(`${id}-name`, fileStore);
  return new File([blob], name, { type: blob.type });
}

export async function del(id: string) {
  return idb.del(id, fileStore);
}
