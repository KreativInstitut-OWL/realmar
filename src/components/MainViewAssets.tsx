import { useStore } from "@/store";
import { AssetDropzone } from "./AssetDropzone";
import { AssetList } from "./AssetList";

export function MainViewAssets() {
  const addAssetsFromFiles = useStore((state) => state.addAssetsFromFiles);

  return (
    <div className="grid gap-12">
      <div className="pt-8 px-12">
        <AssetDropzone
          className="h-48"
          onFiles={async (files) => {
            await addAssetsFromFiles(files);
          }}
        />
      </div>
      <AssetList />
    </div>
  );
}
