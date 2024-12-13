import { GeneratedTarget } from "@/components/GeneratedTarget";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAsset } from "@/store";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";

function TargetImpl({
  assetId,
  itemId,
}: {
  assetId: string | null;
  itemId: string;
}) {
  const { data: asset } = useAsset(assetId);

  return (
    <>
      {asset?.src ? (
        <img src={asset.src} alt="" className="object-contain w-full h-full" />
      ) : (
        <GeneratedTarget id={itemId} />
      )}
      <Badge className="absolute bottom-3 right-3 z-10 hidden @[8rem]/target:flex">
        {asset?.src ? "Custom" : "Auto"}
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
