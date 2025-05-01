import { get } from "idb-keyval";
import {
  APP_STATE_STORAGE_NAME,
  appStateStore,
  Asset,
  createAsset,
  useStore,
} from ".";
import * as FileStore from "./file-store";
import saveAs from "file-saver";
import JSZip from "jszip";
import slugify from "slugify";

export function getAssetFileName(asset: Asset) {
  return `${asset.id}.${asset.file.name.split(".").pop() ?? "bin"}`;
}

export async function save() {
  const projectName =
    useStore.getState().projectName ?? "Untitled Batchar Project";
  const projectNameSlug = slugify(projectName, { lower: true });

  const assets = await FileStore.getAll();

  const appStateString = await get<string>(
    APP_STATE_STORAGE_NAME,
    appStateStore
  );

  if (!appStateString) return;

  const zip = new JSZip();

  zip.file("BATCHAR", `batchar@2\n\n${projectNameSlug}`);

  zip.file("state.json", appStateString);

  // Add assets
  for (const asset of assets) {
    zip.file(`assets/${getAssetFileName(asset)}`, asset.file);
  }

  const assetsMetadata = assets.map((asset) => ({
    id: asset.id,
    path: `assets/${getAssetFileName(asset)}`,
    name: asset.file.name,
    mimeType: asset.file.type,
    size: asset.file.size,
  }));
  zip.file("assets.json", JSON.stringify(assetsMetadata));

  const content = await zip.generateAsync(
    { type: "blob", comment: "batchar" },
    (meta) => {
      console.log(meta.percent.toFixed(2) + "%");
      console.log(meta);
    }
  );
  saveAs(content, `${projectNameSlug}.batchar`);
}

export function load(file: File) {
  const reader = new FileReader();

  reader.onload = async () => {
    const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);

    const batchar = await zip.file("BATCHAR")?.async("text");

    if (!batchar?.startsWith("batchar@2")) {
      throw new Error("Invalid file format");
    }

    const state = await zip.file("state.json")?.async("text");

    if (!state) {
      throw new Error("Invalid file format");
    }

    const assetsMetadata = await zip.file("assets.json")?.async("text");

    if (!assetsMetadata) {
      throw new Error("Invalid file format");
    }

    const assetMetadataArray = JSON.parse(assetsMetadata) as {
      id: string;
      path: string;
      name: string;
      mimeType: string;
      size: number;
    }[];

    const assets = await Promise.all(
      assetMetadataArray.map(async (assetMetadata) => {
        const file = await zip.file(assetMetadata.path)?.async("blob");

        if (!file) {
          throw new Error("Invalid file format");
        }

        return await createAsset({
          id: assetMetadata.id,
          file: new File([file], assetMetadata.name, {
            type: assetMetadata.mimeType,
          }),
        });
      })
    );

    await FileStore.clear();
    await FileStore.addMany(assets);

    useStore.setState(JSON.parse(state).state);
  };

  reader.readAsArrayBuffer(file);
}

export function loadFromFile() {
  // ask for file
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".batchar";
  input.onchange = () => {
    const files = input.files;
    if (files && files.length > 0) {
      load(files[0]);
    }
  };
  input.click();
}
