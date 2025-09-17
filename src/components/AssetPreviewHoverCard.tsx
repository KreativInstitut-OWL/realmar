import { Asset } from "@/store";
import { useFile } from "@/store";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { useObjectUrl } from "@/hooks/useObjectUrl";

interface AssetPreviewHoverCardProps {
  asset: Asset;
  children: React.ReactNode;
}

export function AssetPreviewHoverCard({
  asset,
  children,
}: AssetPreviewHoverCardProps) {
  const file = useFile(asset.fileId);
  const objectUrl = useObjectUrl(file);

  // Only show hover card for image assets
  const isImage = asset.type.startsWith("image/");

  if (!isImage || !objectUrl) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent>
        <img
          src={objectUrl}
          alt={asset.name}
          className="max-w-64 max-h-64 object-contain"
        />
      </HoverCardContent>
    </HoverCard>
  );
}
