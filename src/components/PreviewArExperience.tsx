import { useCompiledPreviewArtifacts } from "@/lib/export";
import { cn } from "@/lib/utils";
import { Blocks, FlipHorizontal2, Loader2, Plus, RotateCw } from "lucide-react";
import { useRef, useState } from "react";
import { AppBreadcrumbPortal } from "./AppBreadcrumb";
import { BreadcrumbItem, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { SplashScreen } from "./SplashScreen";
import { useStore } from "@/store";

export function PreviewArExperienceWrapper() {
  const itemCount = useStore((state) => state.items.length);

  if (itemCount === 0) {
    return (
      <SplashScreen>
        <Button
          variant="secondary"
          onClick={() => {
            useStore.getState().addItem(true);
          }}
        >
          <Plus /> Add your first marker, to preview the experience
        </Button>
      </SplashScreen>
    );
  }

  return <PreviewArExperience />;
}

export function PreviewArExperience() {
  const { progress, data, isFetching, invalidate } =
    useCompiledPreviewArtifacts();
  const ref = useRef<HTMLIFrameElement>(null);
  const [isFlipped, setIsFlipped] = useState(true);

  if (isFetching || !data?.srcDoc) {
    // console.log("srcDoc", data?.srcDoc);
    return (
      <>
        <div className="h-full w-full max-w-prose m-auto flex flex-col gap-4 items-center justify-center p-12">
          <Loader2 className="size-6 animate-spin" />
          <Progress value={progress} />
        </div>
        <AppBreadcrumbPortal>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Compiling Preview…</BreadcrumbItem>
        </AppBreadcrumbPortal>
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

      <AppBreadcrumbPortal>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="inline-flex gap-2 items-center">
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
            aria-label="recompile"
            onClick={() => {
              invalidate();
            }}
          >
            <Blocks /> Recompile
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
        </BreadcrumbItem>
      </AppBreadcrumbPortal>
    </>
  );
}
