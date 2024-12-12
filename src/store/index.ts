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
  shouldPlayAnimation: boolean;
  // editor state
  editorShouldScaleUniformly: boolean;
  editorSelectedAssetId: string | null;
  editorSelectedTab: "marker" | "assets" | "arrange";
  editorCameraPosition: THREE.Vector3Tuple;
};

export type ItemAssetData = {
  id: string;
  marker: Asset | null;
  assets: Asset[];
  selectedAssetIndex: number;
  selectedAsset: Asset | null;
  nextAsset: Asset | null;
  prevAsset: Asset | null;
  assetCount: number;
};

function createItem(props: Partial<Omit<Item, "id">> = {}): Item {
  return {
    id: nanoid(5),
    marker: null,
    assets: [],
    transform: DEFAULT_MATRIX_4_TUPLE,
    lookAtCamera: false,
    shouldPlayAnimation: false,
    editorShouldScaleUniformly: true,
    editorSelectedAssetId: null,
    editorSelectedTab: "marker",
    editorCameraPosition: [2, 2, 2],
    ...props,
  };
}

type AppState = {
  items: Item[];
  currentItemId: string | null;

  setCurrentItemId: (id: string) => void;

  addItem: () => void;

  getItemAssetData: (id: string) => Promise<ItemAssetData | null>;

  setItem: (itemId: string, item: Partial<Item>) => void;

  setItemMarker: (itemId: string, file: File) => Promise<void>;
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
        getItemAssetData: async (id: string) => {
          const { items } = get();
          const item = items.find((item) => item.id === id) || null;
          if (!item) return null;

          const markerFile = item.marker
            ? await FileStore.get(item.marker.id)
            : null;

          const marker = item.marker
            ? {
                ...item.marker,
                file: markerFile,
                src: markerFile ? URL.createObjectURL(markerFile) : null,
              }
            : null;

          const selectedAssetId = item.editorSelectedAssetId;
          const selectedAssetIndex = Math.max(
            item?.assets.findIndex((asset) => asset.id === selectedAssetId) ??
              0,
            0
          );

          const assets = await Promise.all(
            item.assets.map(async (assetRef) => {
              const assetFile = await FileStore.get(assetRef.id);
              return {
                ...assetRef,
                file: assetFile,
                src: assetFile ? URL.createObjectURL(assetFile) : null,
              };
            })
          );

          const selectedAsset = assets[selectedAssetIndex];
          const nextAsset = assets[selectedAssetIndex + 1];
          const prevAsset = assets[selectedAssetIndex - 1];

          // wait 2000ms
          // await new Promise((resolve) => setTimeout(resolve, 2000));

          return {
            id: item.id,
            marker,
            assets,
            selectedAssetIndex,
            selectedAsset,
            nextAsset,
            prevAsset,
            assetCount: item.assets.length,
          };
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
        setItem: async (itemId, itemUpdate) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            Object.assign(item, itemUpdate);
          });

          if ("editorSelectedAssetId" in itemUpdate) {
            await queryClient.invalidateQueries({ queryKey: ["item", itemId] });
          }
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

export function useItemAssetData(id: string | null) {
  const getItemAssets = useStore((state) => state.getItemAssetData);
  return useSuspenseQuery({
    queryKey: ["item", id],
    queryFn: () => (id ? getItemAssets(id) : null),
  });
}

export function useCurrentItemAssetData() {
  return useItemAssetData(useStore((state) => state.currentItemId));
}
