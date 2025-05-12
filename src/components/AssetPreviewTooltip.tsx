import { Asset } from "@/store";
import { GlbPreview } from "./GlbPreview";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AssetPreviewTooltip({
  asset,
  children,
}: {
  asset: Asset;
  children: React.ReactNode;
}) {
  console.log(asset.type);

  // return children;

  if (asset.type !== "model/gltf-binary") {
    return children;
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <GlbPreview fileId={asset.fileId} key={asset.fileId} />
      </TooltipContent>
    </Tooltip>
  );
}
