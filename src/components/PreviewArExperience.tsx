import { useCompiledPreviewArtifacts } from "@/lib/export";
import { FlipHorizontal2, Loader2, RotateCw } from "lucide-react";
import { Progress } from "./ui/progress";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PreviewArExperience({
  itemHeader,
}: {
  itemHeader: HTMLLIElement | null;
}) {
  const { progress, data, isLoading } = useCompiledPreviewArtifacts();
  const ref = useRef<HTMLIFrameElement>(null);
  const [isFlipped, setIsFlipped] = useState(true);

  if (isLoading || !data?.srcDoc) {
    return (
      <>
        <div className="h-full w-full max-w-prose m-auto flex flex-col gap-4 items-center justify-center p-12">
          <Loader2 className="size-6 animate-spin" />
          <Progress value={progress} />
        </div>
        {itemHeader ? createPortal(<span>Loading…</span>, itemHeader) : null}
      </>
    );
  }

  return (
    <>
      <iframe
        ref={ref}
        src="/__preview/index.html"
        srcDoc={data.srcDoc}
        sandbox="allow-scripts allow-same-origin"
        className={cn("w-full h-full", { "scale-x-[-1]": isFlipped })}
      />

      {itemHeader
        ? createPortal(
            <span className="inline-flex gap-2 items-center">
              <Button
                size="sm"
                variant="ghost"
                aria-label="refresh preview"
                onClick={() => {
                  ref.current?.contentWindow?.location.reload();
                }}
              >
                <RotateCw /> Refresh
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="flip preview"
                onClick={() => {
                  setIsFlipped((prev) => !prev);
                }}
              >
                <FlipHorizontal2 /> Flip
              </Button>
            </span>,
            itemHeader
          )
        : null}
    </>
  );
}
