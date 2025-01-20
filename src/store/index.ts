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
};

export function createAsset({
  id,
  file,
  src,
  createdAt,
  updatedAt,
}: Partial<Asset> & { file: File }): Asset {
  const now = new Date();
  return {
    id: id ?? nanoid(5),
    file,
    src: src ?? URL.createObjectURL(file),
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
  };
}

// prettier-ignore
const DEFAULT_TRANSFORM: THREE.Matrix4Tuple = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

const DEFAULT_CAMERA_POSITION: THREE.Vector3Tuple = [2, 2, 2];

export type Entity = {
  id: string;
  assetId: string;
  transform: THREE.Matrix4Tuple;
  lookAtCamera: boolean;
  playAnimation: boolean;
};

function createEntity(
  props: Partial<Omit<Entity, "id">> & { assetId: string }
): Entity {
  return {
    id: nanoid(5),
    transform: DEFAULT_TRANSFORM,
    lookAtCamera: false,
    playAnimation: false,
    ...props,
  };
}

export type Item = {
  id: string;
  targetAssetId: string | null;
  entities: Entity[];
  name: string | null;
  itemDependencyId: string | null;

  // editor state (these have no effect for the export)
  editorLinkTransforms: boolean;
  editorScaleUniformly: boolean;
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

    editorLinkTransforms: true,
    editorScaleUniformly: true,
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

type EditorTab = "items" | "settings";

export interface BaseAppState {
  items: Item[];
  projectName: string;
  editorCurrentItemId: string | null;
  editorCurrentTab: EditorTab;
}

interface AppState extends BaseAppState {
  setEditorCurrentTab: (tab: EditorTab) => void;

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
        projectName: "Batchar Project",

        editorCurrentTab: "items",

        setEditorCurrentTab: (tab: EditorTab) => {
          set((state) => {
            state.editorCurrentTab = tab;
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
          const targetAsset = createAsset({ file });
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
            const asset = createAsset({ file });
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
  });
}
