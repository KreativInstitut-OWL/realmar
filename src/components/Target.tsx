import { GeneratedTarget } from "@/components/GeneratedTarget";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAsset, useFile } from "@/store";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { useObjectUrl } from "@/hooks/useObjectUrl";

function TargetImpl({
  assetId,
  itemId,
}: {
  assetId: string | null;
  itemId: string;
}) {
  const asset = useAsset(assetId);
  const file = useFile(asset?.fileId);
  const src = useObjectUrl(file);

  return (
    <>
      {src ? (
        <img src={src} alt="" className="object-contain w-full h-full" />
      ) : (
        <GeneratedTarget id={itemId} />
      )}
      <Badge className="absolute bottom-3 right-3 z-10 hidden @[8rem]/target:flex">
        {src ? "Custom" : "Auto"}
      </Badge>
    </>
  );
}

export function Target({
  className,
  ...rest
}: React.ComponentProps<typeof TargetImpl> & { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full aspect-square @container/target",
        className
      )}
    >
      <Suspense fallback={<Skeleton className="w-full h-full" />}>
        <TargetImpl {...rest} />
      </Suspense>
    </div>
  );
}
