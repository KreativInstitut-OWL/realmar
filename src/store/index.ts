import { EditorView } from "@/const/editorView";
import { DEFAULT_TRANSFORM } from "@/lib/three";
import { uppercaseFirstLetter } from "@/lib/utils";
import * as FileStore from "@/store/file-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as idb from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { nanoid } from "nanoid";
import { useCallback, useMemo } from "react";
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
  fileId: string;
  type: string;
  name: string;
  originalBasename: string;
  originalExtension: string;
  size: number;
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
  type,
  size,
  fileId,
  name,
  originalBasename,
  originalExtension,
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
  const _originalBasename =
    originalBasename ?? file.name.split(".").slice(0, -1).join(".");
  const _originalExtension =
    originalExtension ?? file.name.split(".").pop() ?? "";

  return {
    id: id ?? nanoid(5),
    fileId: fileId ?? nanoid(5),
    type: type ?? file.type,
    name: name ?? _originalBasename,
    originalBasename: _originalBasename,
    originalExtension: _originalExtension,
    size: size ?? file.size,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
    width,
    height,
    originalWidth,
    originalHeight,
  };
}

export interface ComponentBase<
  TName = string,
  TPayload extends { enabled: boolean } = { enabled: boolean },
> {
  name: TName;
  payload: TPayload;
}

interface ComponentLookAtCamera extends ComponentBase<"look-at-camera"> {}

interface ComponentFloat
  extends ComponentBase<
    "float",
    {
      enabled: boolean;
      speed: number;
      rotationIntensity: number;
      intensity: number;
      floatingRange: [number, number];
    }
  > {}

export type Component = ComponentLookAtCamera | ComponentFloat;

export type ComponentMap = {
  [key in Component["name"]]?: Extract<Component, { name: key }>;
};

function createComponent<
  TName extends Component["name"],
  TPayload = Extract<Component, { name: TName }>["payload"],
>(name: TName, payload: Partial<TPayload>) {
  switch (name) {
    case "look-at-camera":
      return {
        name,
        payload: {
          enabled: true,
          ...payload,
        },
      } as ComponentLookAtCamera;
    case "float":
      return {
        name,
        payload: {
          enabled: true,
          speed: 1,
          rotationIntensity: 1,
          intensity: 1,
          floatingRange: [-0.1, 0.1],
          ...payload,
        },
      } as ComponentFloat;
    default:
      throw new Error(`Unknown component name: ${name}`);
  }
}

export type EntityBase = {
  id: string;
  name: string;
  transform: THREE.Matrix4Tuple;

  // batchar aframe components
  components: ComponentMap;

  // editor state (these have no effect for the export)
  editorScaleUniformly: boolean;
};

export function getComponent<TName extends Component["name"]>(
  entity: { components: ComponentMap } | null | undefined,
  name: TName
) {
  return entity?.components?.[name]?.payload as
    | Extract<Component, { name: TName }>["payload"]
    | undefined;
}

export type EntityBaseWithAsset = EntityBase & {
  assetId: string | null;
};

export type EntityNull = EntityBase & {
  type: "null";
};

export type EntityImage = EntityBaseWithAsset & {
  type: "image";
};

export type EntityVideo = EntityBaseWithAsset & {
  type: "video";
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
};

export type EntityModel = EntityBaseWithAsset & {
  type: "model";
  playAnimation: boolean;
};

export type FontDef = {
  family: string;
  style: string;
  path: string;
};

export const systemFonts = [
  {
    family: "Open Sans",
    style: "Regular",
    path: "/Open_Sans_Regular.json",
  },
  {
    family: "Open Sans",
    style: "Bold",
    path: "/Open_Sans_Bold.json",
  },
] as const satisfies FontDef[];

type SystemFont = (typeof systemFonts)[number];

export type EntityText = EntityBase & {
  type: "text";
  text: string;
  font: SystemFont;
  curveSegments: number;
  bevelSize: number;
  bevelThickness: number;
  height: number;
  lineHeight: number;
  letterSpacing: number;
  fontSize: number;
  color: string;
};

export type Entity =
  | EntityNull
  | EntityImage
  | EntityVideo
  | EntityModel
  | EntityText;

export type EntityType = Entity["type"];

export type EntityWithAsset = EntityImage | EntityVideo | EntityModel;
export type EntityWithoutAsset = EntityNull | EntityText;

// Helper type for entities that require an assetId
export type EntityWithAssetType = EntityWithAsset["type"];

// Overload for asset-based entities (requires assetId)
export function createEntity<T extends EntityWithAssetType>(
  props: { type: T; assetId: string } & Partial<
    Omit<Extract<Entity, { type: T }>, "id" | "type" | "assetId">
  >
): Extract<Entity, { type: T }>;

// Text entity overload
export function createEntity(
  props: { type: "text" } & Partial<Omit<EntityText, "id" | "type">>
): EntityText;

// Null entity overload
export function createEntity(
  props?: { type?: "null" } & Partial<Omit<EntityNull, "id" | "type">>
): EntityNull;

// Implementation
export function createEntity(props: Partial<Omit<Entity, "id">> = {}): Entity {
  const { type = "null", ...restProps } = props;

  // Base entity properties common to all types
  const baseEntity: EntityBase = {
    id: nanoid(5),
    name: uppercaseFirstLetter(type),
    transform: DEFAULT_TRANSFORM,
    components: {},
    editorScaleUniformly: true,
  };

  switch (type) {
    case "image":
      return {
        ...baseEntity,
        type: "image",
        assetId: (props as EntityBaseWithAsset).assetId, // The overload ensures assetId is present
        ...restProps,
      } as EntityImage;

    case "video":
      return {
        ...baseEntity,
        type: "video",
        assetId: (props as EntityBaseWithAsset).assetId, // The overload ensures assetId is present
        autoplay: true,
        muted: true,
        loop: true,
        ...restProps,
      } as EntityVideo;

    case "model":
      return {
        ...baseEntity,
        type: "model",
        assetId: (props as EntityBaseWithAsset).assetId, // The overload ensures assetId is present
        playAnimation: false,
        ...restProps,
      } as EntityModel;

    case "text":
      return {
        ...baseEntity,
        type: "text",
        text: "",
        font: systemFonts[0],
        curveSegments: 12,
        bevelSize: 0,
        bevelThickness: 0,
        height: 0,
        lineHeight: 0.7,
        letterSpacing: 0,
        fontSize: 0.1,
        color: "#ffffff",
        ...restProps,
      } as EntityText;

    case "null":
    default:
      return {
        ...baseEntity,
        type: "null",
        ...restProps,
      } as EntityNull;
  }
}

export function isEntityWithAsset(
  entity: Entity | undefined
): entity is EntityWithAsset {
  return (
    entity?.type === "image" ||
    entity?.type === "video" ||
    entity?.type === "model"
  );
}
export function isEntityNull(entity: Entity): entity is EntityNull {
  return entity.type === "null";
}
export function assertIsEntityNull(
  entity: Entity
): asserts entity is EntityNull {
  if (entity.type !== "null") throw new Error("Entity is not of type 'null'");
}
export function isEntityText(entity: Entity): entity is EntityText {
  return entity.type === "text";
}
export function assertIsEntityText(
  entity: Entity
): asserts entity is EntityText {
  if (entity.type !== "text") throw new Error("Entity is not of type 'text'");
}
export function isEntityVideo(entity: Entity): entity is EntityVideo {
  return entity.type === "video";
}
export function assertIsEntityVideo(
  entity: Entity
): asserts entity is EntityVideo {
  if (entity.type !== "video") throw new Error("Entity is not of type 'video'");
}
export function isEntityImage(entity: Entity): entity is EntityImage {
  return entity.type === "image";
}
export function assertIsEntityImage(
  entity: Entity
): asserts entity is EntityImage {
  if (entity.type !== "image") throw new Error("Entity is not of type 'image'");
}
export function isEntityModel(entity: Entity): entity is EntityModel {
  return entity.type === "model";
}
export function assertIsEntityModel(
  entity: Entity
): asserts entity is EntityModel {
  if (entity.type !== "model") throw new Error("Entity is not of type 'model'");
}

export function inferEntityTypeFromAsset(asset: Asset): EntityWithAssetType {
  if (asset.type.startsWith("image/")) {
    return "image";
  }
  if (asset.type.startsWith("video/")) {
    return "video";
  }
  if (asset.type.startsWith("model/")) {
    return "model";
  }
  throw new Error(`Unsupported asset type: ${asset.type}`);
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
  editorCurrentTab: "entities" | "target";
};

function createItem(props: Partial<Omit<Item, "id">> = {}): Item {
  return {
    id: nanoid(5),
    targetAssetId: null,
    entities: [],
    name: null,
    itemDependencyId: null,
    displayMode: "scene",

    editorLinkTransforms: false,
    editorPivotControlScale: 0.5,
    editorCurrentEntityId: null,
    editorCurrentTab: "entities",
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
  assets: Asset[];
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
    entityUpdate: Partial<Entity>
  ) => void;

  setItemEntityComponent: <TName extends Component["name"]>(
    itemId: string,
    entityId: string,
    componentName: TName,
    payloadUpdate:
      | Partial<Extract<Component, { name: TName }>["payload"]>
      | undefined
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

  setItemTargetFromFile: (itemId: string, file: File) => Promise<void>;
  removeItemTarget: (itemId: string) => void;

  addItemEntity: (itemId: string, entity: Entity) => Promise<void>;
  addItemEntitiesFromFiles: (id: string, files: File[]) => Promise<void>;
  addItemEntitiesFromAssetIds: (id: string, assetIds: string[]) => void;
  removeItemEntities: (itemId: string, entityIds: string[]) => void;

  addAssetsFromFiles: (files: File[]) => Promise<void>;
  moveAsset: (oldIndex: number, newIndex: number) => void;
  moveAssets: (assetIds: string[], newIndex: number) => void;
  setAsset: (assetId: string, assetUpdate: Partial<Asset>) => void;
  deleteAssets: (
    assetIds: string[],
    mode?: DeleteReferenceMode
  ) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => {
      const initialItem = createItem();
      return {
        items: [initialItem],
        assets: [],

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

          // if (item.targetAssetId) {
          //   await FileStore.del(item.targetAssetId);
          // }

          // for (const entity of item.entities) {
          //   if (!isEntityWithAsset(entity)) continue;
          //   await FileStore.del(entity.assetId);
          // }

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

        setItemTargetFromFile: async (itemId, file) => {
          const targetAsset = await createAsset({ file });
          await FileStore.add({ id: targetAsset.fileId, file });

          set((state) => {
            state.assets.push(targetAsset);

            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.targetAssetId = targetAsset.id;

            console.log("target asset", targetAsset, file, item.targetAssetId);
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

        setItemEntityComponent: (
          itemId,
          entityId,
          componentName,
          payloadUpdate
        ) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            const entity = item.entities.find(
              (entity) => entity.id === entityId
            );
            if (!entity) return;
            if (payloadUpdate) {
              if (!entity.components) {
                entity.components = {};
              }
              entity.components[componentName] = createComponent(
                componentName,
                {
                  ...entity.components[componentName]?.payload,
                  ...payloadUpdate,
                }
              ) as ComponentMap[typeof componentName];
            } else {
              delete entity.components[componentName];
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

        removeItemTarget: (itemId) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.targetAssetId = null;
          });

          // const targetAssetId =
          //   get().items.find((item) => item.id === itemId)?.targetAssetId ??
          //   null;

          // if (targetAssetId) {
          //   await FileStore.del(targetAssetId);
          // }
        },

        addItemEntity: async (itemId, entity) => {
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.entities.push(entity);
          });
        },

        addItemEntitiesFromFiles: async (itemId, files) => {
          const newEntities: Entity[] = [];
          const newAssets: Asset[] = [];

          for (const file of files) {
            const asset = await createAsset({ file });
            await FileStore.add({ id: asset.fileId, file });
            newAssets.push(asset);

            const entity = createEntity({
              type: inferEntityTypeFromAsset(asset),
              name: asset.name,
              assetId: asset.id,
            });
            newEntities.push(entity);
          }

          set((state) => {
            state.assets.push(...newAssets);

            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.entities.push(...newEntities);
          });
        },

        addItemEntitiesFromAssetIds: (itemId, assetIds) => {
          const newEntities: Entity[] = [];

          const assets = get().assets.filter((asset) =>
            assetIds.includes(asset.id)
          );

          console.log("found assets", assets);

          for (const asset of assets) {
            const entity = createEntity({
              type: inferEntityTypeFromAsset(asset),
              name: asset.name,
              assetId: asset.id,
            });
            newEntities.push(entity);
          }
          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.entities.push(...newEntities);
          });
        },

        removeItemEntities: (itemId, entityIds) => {
          // const entities =
          //   get()
          //     .items.find((item) => item.id === itemId)
          //     ?.entities.filter((entity) => entityIds.includes(entity.id)) ??
          //   [];

          // await Promise.all(
          //   entities
          //     .filter((entity) => isEntityWithAsset(entity))
          //     .map((entity) => FileStore.del(entity.assetId))
          // );

          set((state) => {
            const item = state.items.find((item) => item.id === itemId);
            if (!item) return;
            item.entities = item.entities.filter(
              (entity) => !entityIds.includes(entity.id)
            );
          });
        },

        addAssetsFromFiles: async (files) => {
          // Process all assets in parallel
          const assetPromises = files.map(async (file) => {
            const asset = await createAsset({ file });
            await FileStore.add({ id: asset.fileId, file });
            return asset;
          });

          // Wait for all assets to be processed and collect IDs
          const newAssets = await Promise.all(assetPromises);

          set((state) => {
            state.assets.push(...newAssets);
          });
        },

        moveAsset: (oldIndex, newIndex) => {
          set((state) => {
            const [removedAsset] = state.assets.splice(oldIndex, 1);
            state.assets.splice(newIndex, 0, removedAsset);
          });
        },

        moveAssets: (assetIds, newIndex) => {
          set((state) => {
            const assets = state.assets.filter((entity) =>
              assetIds.includes(entity.id)
            );
            const otherAssets = state.assets.filter(
              (entity) => !assetIds.includes(entity.id)
            );
            state.assets = [
              ...otherAssets.slice(0, newIndex),
              ...assets,
              ...otherAssets.slice(newIndex),
            ];
          });
        },

        setAsset: (assetId, assetUpdate) => {
          set((state) => {
            const asset = state.assets.find((asset) => asset.id === assetId);
            if (!asset) return;
            Object.assign(asset, assetUpdate);
          });
        },

        deleteAssets: async (assetIds, mode = "restrict") => {
          // loop through all item entities and handle the reference delete mode
          for (const item of get().items) {
            for (const entity of item.entities) {
              if (!isEntityWithAsset(entity)) continue;
              if (
                entity.assetId !== null &&
                assetIds.includes(entity.assetId)
              ) {
                if (mode === "restrict") {
                  throw new DeleteReferenceError(
                    `Cannot delete asset ${entity.assetId} because it is used in item ${item.id}`
                  );
                }
              }
            }
          }

          const assets =
            get().assets.filter((asset) => assetIds.includes(asset.id)) ?? [];

          await Promise.all(assets.map((asset) => FileStore.del(asset.id)));

          set((state) => {
            // TODO: This could be optimized by noting the path to be deleted/nulled the first time we loop through items and entities
            for (const item of state.items) {
              for (const entity of item.entities) {
                if (!isEntityWithAsset(entity)) continue;
                if (mode === "cascade") {
                  // remove the entity from the item
                  item.entities = item.entities.filter(
                    (e) => e.id !== entity.id
                  );
                } else if (mode === "set-null") {
                  // set the assetId to null
                  entity.assetId = null;
                }
              }
            }

            state.assets = state.assets.filter(
              (asset) => !assetIds.includes(asset.id)
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

export function useFile(fileId: string | null | undefined) {
  const { data: file } = useSuspenseQuery({
    queryKey: ["file", fileId],
    queryFn: () => FileStore.get(fileId),
    networkMode: "always",
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return file;
}

export function useAsset(assetId: string | null | undefined) {
  return useStore((state) =>
    assetId ? state.assets.find((asset) => asset.id === assetId) : undefined
  );
}

export function useUpdateEntity(
  itemId: string | null | undefined,
  entityId: string | null | undefined
) {
  return useCallback(
    (updatePayload: Partial<Entity>) => {
      if (!itemId || !entityId) return;
      useStore.getState().setItemEntity(itemId, entityId, updatePayload);
    },
    [itemId, entityId]
  );
}

export function useUpdateEntityComponent<TName extends Component["name"]>(
  itemId: string | null | undefined,
  entityId: string | null | undefined,
  componentName: TName
) {
  return useCallback(
    <
      TPayload extends
        | Partial<Extract<Component, { name: TName }>["payload"]>
        | undefined,
    >(
      payloadUpdate: TPayload
    ) => {
      if (!itemId || !entityId) return;
      useStore.getState().setItemEntityComponent(
        itemId,
        entityId,
        componentName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payloadUpdate as any
      );
    },
    [itemId, entityId, componentName]
  );
}

type DeleteReferenceMode = "restrict" | "cascade" | "set-null";

export class DeleteReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeleteReferenceError";
  }
}
