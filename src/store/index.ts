import * as FileStore from "@/store/file-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as idb from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { nanoid } from "nanoid";
import { useMemo } from "react";
import * as THREE from "three";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const appStateStore = idb.createStore("batchar-state", "state");

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
};

export function createAsset({
  id,
  file,
  src,
}: Partial<Asset> & { file: File }): Asset {
  return {
    id: id ?? nanoid(5),
    file,
    src: src ?? URL.createObjectURL(file),
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

type AppState = {
  items: Item[];
  currentItemId: string | null;

  setCurrentItemId: (id: string) => void;

  addItem: (setAsCurrentItem?: boolean) => Item;
  setItem: (itemId: string, item: Partial<Item>) => void;
  setItemEntity: (
    itemId: string,
    entityId: string,
    entity: Partial<Entity>
  ) => void;

  setItemTarget: (itemId: string, file: File) => Promise<void>;
  removeItemTarget: (itemId: string) => Promise<void>;

  addItemEntities: (id: string, files: File[]) => Promise<void>;
  removeItemEntity: (itemId: string, entityId: string) => Promise<void>;
};

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => {
      const initialItem = createItem();
      return {
        items: [initialItem],
        currentItemId: initialItem.id,

        setCurrentItemId: (id: string) => {
          set((state) => {
            state.currentItemId = id;
          });
        },

        addItem: (setAsCurrentItem) => {
          const newItem = createItem();
          set((state) => {
            state.items.push(newItem);
            if (setAsCurrentItem) {
              state.currentItemId = newItem.id;
            }
          });
          return newItem;
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

        removeItemEntity: async (itemId, entityId) => {
          const entity = get()
            .items.find((item) => item.id === itemId)
            ?.entities.find((entity) => entity.id === entityId);

          if (entity) {
            await FileStore.del(entity.assetId);
          }

          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            const entityIndex = item.entities.findIndex(
              (entity) => entity.id === entityId
            );
            if (entityIndex === -1) return;
            item.entities.splice(entityIndex, 1);
          });
        },
      };
    }),
    {
      name: "app-state-store",
      storage: createJSONStorage(() => storage),
    }
  )
);

export function useItem(
  itemId: string
): (Item & { index: number; entityNavigation: EntityNavigation }) | null {
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

  return { ...item, index, entityNavigation: entityNavigation! };
}

export function useCurrentItem() {
  return useItem(useStore((state) => state.currentItemId!))!;
}

export function useAsset(assetId: string | null | undefined) {
  return useSuspenseQuery({
    queryKey: ["asset", assetId],
    queryFn: () => FileStore.get(assetId),
  });
}
