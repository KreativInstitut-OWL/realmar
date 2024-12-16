import { ArrowRightFromLine, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

import { bundleFiles, defaultProgress, ProgressUpdate } from "@/lib/export";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";

function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate>(defaultProgress);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setIsComplete(false);
    setProgress(defaultProgress);
    bundleFiles((progress) => setProgress(progress)).finally(() => {
      if (!isMountedRef.current) return;
      setIsComplete(true);

      setTimeout(() => {
        if (!isMountedRef.current) return;
        setIsExporting(false);
        setProgress(defaultProgress);
        setIsComplete(false);
      }, 2000);
    });
  }, []);

  console.log("ExportButton", progress);

  return (
    <Dialog open={isExporting}>
      <Button className="ml-auto" onClick={handleExport}>
        Export
        <ArrowRightFromLine />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {progress.stage === "compile" ? `Compiling…` : "Bundling…"}(
            {((isComplete ? 100 : progress.progress) ?? 0).toFixed(2)}%)
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 items-center">
          {isComplete ? (
            <CheckCircle className="size-6" />
          ) : (
            <Loader2 className="size-6 animate-spin" />
          )}
          <Progress value={isComplete ? 100 : progress.progress} />
          <span className="text-sm text-gray-400">
            {progress.currentBundleFile ?? ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportButton;
