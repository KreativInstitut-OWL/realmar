import { EditorView } from "@/const/editorView";
import { DEFAULT_TRANSFORM } from "@/lib/three";
import * as FileStore from "@/store/file-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as idb from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { nanoid } from "nanoid";
import { useMemo } from "react";
import * as THREE from "three";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const appStateStore = idb.createStore("batchar-state", "state");

export const APP_STATE_STORAGE_NAME = "batchar-state";

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> =>
    (await idb.get(name, appStateStore)) || null,
  setItem: async (name: string, value: string): Promise<void> =>
    await idb.set(name, value, appStateStore),
  removeItem: async (name: string): Promise<void> =>
    await idb.del(name, appStateStore),
};

export type Asset = {
  id: string;
  file: File;
  src: string;
  createdAt: Date;
  updatedAt: Date;
  width: number | null;
  height: number | null;
  originalWidth: number | null;
  originalHeight: number | null;
};

export async function createAsset({
  id,
  file,
  src,
  createdAt,
  updatedAt,
}: Partial<Asset> & { file: File }): Promise<Asset> {
  // if asset type is image or video, we can get the width and height
  // from the file itself

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  let width = null;
  let height = null;
  let originalWidth = null;
  let originalHeight = null;

  if (isImage) {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    await new Promise<void>((resolve) => {
      image.onload = () => {
        if (!image.width || !image.height) {
          resolve();
          return;
        }
        width = image.width / Math.min(image.width, image.height);
        height = image.height / Math.min(image.width, image.height);
        originalWidth = image.width;
        originalHeight = image.height;
        resolve();
      };
    });
  } else if (isVideo) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        if (!video.videoWidth || !video.videoHeight) {
          resolve();
          return;
        }
        width =
          video.videoWidth / Math.min(video.videoWidth, video.videoHeight);
        height =
          video.videoHeight / Math.min(video.videoWidth, video.videoHeight);
        originalWidth = video.videoWidth;
        originalHeight = video.videoHeight;
        resolve();
      };
    });
  }

  const now = new Date();
  return {
    id: id ?? nanoid(5),
    file,
    src: src ?? URL.createObjectURL(file),
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
    width,
    height,
    originalWidth,
    originalHeight,
  };
}

const DEFAULT_CAMERA_POSITION: THREE.Vector3Tuple = [2, 2, 2];

export type Entity = {
  id: string;
  assetId: string;
  transform: THREE.Matrix4Tuple;
  lookAtCamera: boolean;

  // model properties
  modelPlayAnimation: boolean;

  // video properties
  videoAutoplay: boolean;
  videoMuted: boolean;
  videoLoop: boolean;

  // editor state (these have no effect for the export)
  editorScaleUniformly: boolean;
};

function createEntity(
  props: Partial<Omit<Entity, "id">> & { assetId: string }
): Entity {
  return {
    id: nanoid(5),
    transform: DEFAULT_TRANSFORM,
    lookAtCamera: false,
    modelPlayAnimation: false,
    videoAutoplay: true,
    videoMuted: true,
    videoLoop: true,
    editorScaleUniformly: false,
    ...props,
  };
}

export type Item = {
  id: string;
  targetAssetId: string | null;
  entities: Entity[];
  name: string | null;
  itemDependencyId: string | null;
  displayMode: "gallery" | "scene";

  // editor state (these have no effect for the export)
  editorLinkTransforms: boolean;
  editorPivotControlScale: number;
  editorCurrentEntityId: string | null;
  editorCurrentTab: "target" | "entities" | "arrange";
  editorCameraPosition: THREE.Vector3Tuple;
};

function createItem(props: Partial<Omit<Item, "id">> = {}): Item {
  return {
    id: nanoid(5),
    targetAssetId: null,
    entities: [],
    name: null,
    itemDependencyId: null,
    displayMode: "scene",

    editorLinkTransforms: true,
    editorPivotControlScale: 0.5,
    editorCurrentEntityId: null,
    editorCurrentTab: "target",
    editorCameraPosition: DEFAULT_CAMERA_POSITION,
    ...props,
  };
}

export type EntityNavigation = {
  currentIndex: number;
  current: Entity | null;
  next: Entity | null;
  prev: Entity | null;
  count: number;
};

function createEntityNavigation({
  entities,
  editorCurrentEntityId,
}: Pick<Item, "entities" | "editorCurrentEntityId">): EntityNavigation {
  const currentIndex = Math.max(
    entities.findIndex((entity) => entity.id === editorCurrentEntityId),
    0
  );
  const current = entities[currentIndex] ?? null;
  const next = entities[currentIndex + 1] ?? null;
  const prev = entities[currentIndex - 1] ?? null;
  const count = entities.length;

  return {
    currentIndex,
    current,
    next,
    prev,
    count,
  };
}

export interface BaseAppState {
  items: Item[];
  projectName: string | null;
  editorCurrentItemId: string | null;
  editorCurrentView: EditorView;
}

interface AppState extends BaseAppState {
  setProjectName: (name: string) => void;

  setEditorCurrentView: (tab: EditorView) => void;

  setEditorCurrentItemId: (id: string | null) => void;

  addItem: (setAsCurrentItem?: boolean) => Item;

  setItem: (itemId: string, item: Partial<Item>) => void;
  moveItem: (oldIndex: number, newIndex: number) => void;

  removeItem: (itemId: string) => Promise<void>;

  setItemEntity: (
    itemId: string,
    entityId: string,
    entity: Partial<Entity>
  ) => void;
  moveItemEntity: (itemId: string, oldIndex: number, newIndex: number) => void;

  moveItemEntities: (
    itemId: string,
    entityIds: string[],
    newIndex: number
  ) => void;

  sendItemEntitiesToItem: (
    itemId: string,
    entityIds: string[],
    newItemId: string
  ) => void;

  setItemTarget: (itemId: string, file: File) => Promise<void>;
  removeItemTarget: (itemId: string) => Promise<void>;

  addItemEntities: (id: string, files: File[]) => Promise<void>;
  removeItemEntities: (itemId: string, entityIds: string[]) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => {
      const initialItem = createItem();
      return {
        items: [initialItem],
        projectName: null,

        setProjectName: (name) => {
          set((state) => {
            state.projectName = name;
          });
        },

        editorCurrentView: "items",

        setEditorCurrentView: (tab: EditorView) => {
          set((state) => {
            state.editorCurrentView = tab;
          });
        },

        editorCurrentItemId: initialItem.id,

        setEditorCurrentItemId: (id) => {
          set((state) => {
            state.editorCurrentItemId = id;
          });
        },

        addItem: (setAsCurrentItem) => {
          const newItem = createItem();
          set((state) => {
            state.items.push(newItem);
            if (setAsCurrentItem) {
              state.editorCurrentItemId = newItem.id;
            }
          });
          return newItem;
        },

        removeItem: async (itemId) => {
          const item = get().items.find((item) => item.id === itemId);
          if (!item) return;

          if (item.targetAssetId) {
            await FileStore.del(item.targetAssetId);
          }

          for (const entity of item.entities) {
            await FileStore.del(entity.assetId);
          }

          set((state) => {
            const index = state.items.findIndex((item) => item.id === itemId);
            if (index === -1) return;

            // set dependent items dependency to null
            state.items.forEach((item) => {
              if (item.itemDependencyId === itemId) {
                item.itemDependencyId = null;
              }
            });

            state.items.splice(index, 1);
            if (state.editorCurrentItemId === itemId) {
              state.editorCurrentItemId = state.items[index]?.id ?? null;
            }
          });
        },

        moveItem: (oldIndex, newIndex) => {
          set((state) => {
            const [removedItem] = state.items.splice(oldIndex, 1);
            state.items.splice(newIndex, 0, removedItem);
          });
        },

        setItemTarget: async (itemId, file) => {
          const targetAsset = await createAsset({ file });
          await FileStore.add(targetAsset);

          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.targetAssetId = targetAsset.id;
          });
        },

        setItem: (itemId, itemUpdate) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            Object.assign(item, itemUpdate);
          });
        },

        setItemEntity: (itemId, entityId, entityUpdate) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            if (item.editorLinkTransforms) {
              item.entities.forEach((entity) => {
                Object.assign(entity, entityUpdate);
              });
            } else {
              const entity = item.entities.find(
                (entity) => entity.id === entityId
              );
              if (!entity) return;
              Object.assign(entity, entityUpdate);
            }
          });
        },

        moveItemEntity: (itemId, oldIndex, newIndex) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            const [removedEntity] = item.entities.splice(oldIndex, 1);
            item.entities.splice(newIndex, 0, removedEntity);
          });
        },

        moveItemEntities: (itemId, entityIds, newIndex) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            const entities = item.entities.filter((entity) =>
              entityIds.includes(entity.id)
            );
            const otherEntities = item.entities.filter(
              (entity) => !entityIds.includes(entity.id)
            );
            item.entities = [
              ...otherEntities.slice(0, newIndex),
              ...entities,
              ...otherEntities.slice(newIndex),
            ];
          });
        },

        sendItemEntitiesToItem: (itemId, entityIds, newItemId) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            const newItem = state.items.find((item) => item.id === newItemId);

            if (!item || !newItem) return;
            const entities = item.entities.filter((entity) =>
              entityIds.includes(entity.id)
            );
            const otherEntities = item.entities.filter(
              (entity) => !entityIds.includes(entity.id)
            );
            item.entities = otherEntities;
            newItem.entities.push(...entities);
          });
        },

        removeItemTarget: async (itemId) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.targetAssetId = null;
          });

          const targetAssetId =
            get().items.find((item) => item.id === itemId)?.targetAssetId ??
            null;

          if (targetAssetId) {
            await FileStore.del(targetAssetId);
          }
        },

        addItemEntities: async (id, files) => {
          const newEntities: Entity[] = [];

          for (const file of files) {
            const asset = await createAsset({ file });
            await FileStore.add(asset);
            const entity = createEntity({ assetId: asset.id });

            newEntities.push(entity);
          }

          set((state) => {
            const item = state.items.find((item) => item.id === id);
            if (!item) return;
            item.entities.push(...newEntities);
          });
        },

        removeItemEntities: async (itemId, entityIds) => {
          const entities =
            get()
              .items.find((item) => item.id === itemId)
              ?.entities.filter((entity) => entityIds.includes(entity.id)) ??
            [];

          await Promise.all(
            entities.map((entity) => FileStore.del(entity.assetId))
          );

          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.entities = item.entities.filter(
              (entity) => !entityIds.includes(entity.id)
            );
          });
        },
      };
    }),
    {
      version: 1,
      name: APP_STATE_STORAGE_NAME,
      storage: createJSONStorage(() => storage),
    }
  )
);

export function useItem(itemId: string):
  | (Item & {
      index: number;
      entityNavigation: EntityNavigation;
    })
  | null {
  const index = useStore((state) =>
    state.items.findIndex((item) => item.id === itemId)
  );
  const item = useStore((state) => state.items[index]);

  const entityNavigation = useMemo(
    () =>
      item?.entities
        ? createEntityNavigation({
            entities: item.entities,
            editorCurrentEntityId: item.editorCurrentEntityId,
          })
        : null,
    [item?.entities, item?.editorCurrentEntityId]
  );

  if (!item) return null;

  return {
    ...item,
    index,
    entityNavigation: entityNavigation!,
  };
}

export function useCurrentItem() {
  return useItem(useStore((state) => state.editorCurrentItemId!))!;
}

export function useAsset(assetId: string | null | undefined) {
  return useSuspenseQuery({
    queryKey: ["asset", assetId],
    queryFn: () => FileStore.get(assetId),
    networkMode: "always",
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
