import * as FileStore from "@/store/file-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as idb from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { nanoid } from "nanoid";
import * as THREE from "three";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { queryClient } from "./query-client";

const appStateStore = idb.createStore("app-state-store", "app-state-store");

// Custom storage object
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log(name, "has been retrieved");
    return (await idb.get(name, appStateStore)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log(name, "with value", value, "has been saved");
    await idb.set(name, value, appStateStore);
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log(name, "has been deleted");
    await idb.del(name, appStateStore);
  },
};

type AssetRef = {
  id: string;
};

export type Asset = AssetRef & {
  file: File | null;
  src: string | null;
};

function createAssetRef(props: Partial<Omit<AssetRef, "id">> = {}): AssetRef {
  return {
    id: nanoid(5),
    ...props,
  };
}

const DEFAULT_MATRIX_4_TUPLE: THREE.Matrix4Tuple = [
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
];

export type Item = {
  id: string;
  marker: AssetRef | null;
  assets: AssetRef[];
  transform: THREE.Matrix4Tuple;
  lookAtCamera: boolean;
  shouldScaleUniformly: boolean;
  shouldPlayAnimation: boolean;
};

export type ItemAssets = {
  id: string;
  marker: Asset | null;
  assets: Asset[];
};

function createItem(props: Partial<Omit<Item, "id">> = {}): Item {
  return {
    id: nanoid(5),
    marker: null,
    assets: [],
    transform: DEFAULT_MATRIX_4_TUPLE,
    lookAtCamera: false,
    shouldScaleUniformly: true,
    shouldPlayAnimation: false,
    ...props,
  };
}

type AppState = {
  items: Item[];
  addItem: () => void;
  currentItemId: string | null;
  setCurrentItemId: (id: string) => void;
  getItemAssets: (id: string) => Promise<ItemAssets | null>;
  getCurrentItemAssets: () => Promise<ItemAssets | null>;
  setItemMarker: (itemId: string, file: File) => Promise<void>;
  setItemTransform: (
    itemId: string,
    transform: THREE.Matrix4Tuple
  ) => Promise<void>;
  setItemLookAtCamera: (itemId: string, lookAtCamera: boolean) => Promise<void>;
  setItemShouldScaleUniformly: (
    itemId: string,
    shouldScaleUniformly: boolean
  ) => Promise<void>;
  setItemShouldPlayAnimation: (
    itemId: string,
    shouldPlayAnimation: boolean
  ) => Promise<void>;
  removeItemMarker: (itemId: string) => Promise<void>;
  addItemAssets: (id: string, files: File[]) => Promise<void>;
  removeItemAsset: (itemId: string, assetId: string) => Promise<void>;
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
        addItem: () => {
          set((state) => {
            state.items.push(createItem());
          });
        },
        getItemAssets: async (id: string) => {
          const { items } = get();
          const itemPersist = items.find((item) => item.id === id) || null;
          if (!itemPersist) return null;

          const markerFile = itemPersist.marker
            ? await FileStore.get(itemPersist.marker.id)
            : null;

          // wait 2000ms
          // await new Promise((resolve) => setTimeout(resolve, 2000));

          return {
            ...itemPersist,
            marker: itemPersist.marker
              ? {
                  ...itemPersist.marker,
                  file: markerFile,
                  src: markerFile ? URL.createObjectURL(markerFile) : null,
                }
              : null,
            assets: await Promise.all(
              itemPersist.assets.map(async (assetRef) => {
                const assetFile = await FileStore.get(assetRef.id);
                return {
                  ...assetRef,
                  file: assetFile,
                  src: assetFile ? URL.createObjectURL(assetFile) : null,
                };
              })
            ),
          };
        },
        getCurrentItemAssets: async () => {
          const { currentItemId, getItemAssets: getItem } = get();
          if (!currentItemId) return null;
          return getItem(currentItemId);
        },
        setItemMarker: async (itemId, file) => {
          const markerRef = createAssetRef();
          await FileStore.add(markerRef.id, file);

          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.marker = markerRef;
          });

          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
        setItemTransform: async (itemId, transform) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.transform = transform;
          });

          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
        setItemLookAtCamera: async (itemId, lookAtCamera) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.lookAtCamera = lookAtCamera;
          });

          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
        setItemShouldScaleUniformly: async (itemId, shouldScaleUniformly) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.shouldScaleUniformly = shouldScaleUniformly;
          });

          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
        setItemShouldPlayAnimation: async (itemId, shouldPlayAnimation) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.shouldPlayAnimation = shouldPlayAnimation;
          });

          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
        removeItemMarker: async (itemId) => {
          const markerRef =
            get().items.find((item) => item.id === itemId)?.marker ?? null;

          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.marker = null;
          });

          if (markerRef) {
            await FileStore.del(markerRef.id);
          }

          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
        addItemAssets: async (id, files) => {
          const newAssets: AssetRef[] = [];
          for (const file of files) {
            const assetRef = createAssetRef();
            await FileStore.add(assetRef.id, file);
            newAssets.push(assetRef);
          }

          set((state) => {
            const item = state.items.find((item) => item.id === id);
            if (!item) return;
            item.assets.push(...newAssets);
          });

          await queryClient.invalidateQueries({ queryKey: ["item", id] });
        },
        removeItemAsset: async (itemId, assetId) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            const assetIndex = item.assets.findIndex(
              (asset) => asset.id === assetId
            );
            if (assetIndex === -1) return;
            item.assets.splice(assetIndex, 1);
          });

          await FileStore.del(assetId);
          await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        },
      };
    }),
    {
      name: "app-state-store",
      storage: createJSONStorage(() => storage),
    }
  )
);

export function useItemAssets(id: string | null) {
  const getItem = useStore((state) => state.getItemAssets);
  return useSuspenseQuery({
    queryKey: ["item", id],
    queryFn: () => (id ? getItem(id) : null),
  });
}

export function useCurrentItemAssets() {
  return useItemAssets(useStore((state) => state.currentItemId));
}
