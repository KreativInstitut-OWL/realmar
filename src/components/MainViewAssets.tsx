/* eslint-disable @typescript-eslint/no-explicit-any */

import { AssetDropzone } from "./AssetDropzone";
import { AssetList } from "./AssetList";

export function MainViewAssets() {
  return (
    <div className="grid gap-12">
      <div className="pt-8 px-12">
        <AssetDropzone className="h-48" />
      </div>
      <AssetList />
    </div>
  );
}
