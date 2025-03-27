import { createExport, defaultProgress, ProgressUpdate } from "@/lib/export";
import { useMutation } from "@tanstack/react-query";
import { ArrowRightFromLine, Loader2 } from "lucide-react"; // Replace with actual icon imports
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

function ExportButton() {
  const [progress, setProgress] = useState<ProgressUpdate>(defaultProgress);

  const mutation = useMutation({
    mutationKey: ["export"],
    mutationFn: createExport,
    onSuccess() {
      toast.success("Export successful");
    },
    onError(error) {
      toast.error("Export failed");
      console.error(error);
    },
  });

  const handleExport = useCallback(() => {
    mutation.mutate((progress) => setProgress(progress));
  }, [mutation]);

  return (
    <Dialog open={mutation.isPending}>
      <Button onClick={handleExport} disabled={mutation.isPending}>
        Export
        <ArrowRightFromLine />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {progress.stage === "compile" ? `Compiling…` : "Bundling…"} (
            {new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              style: "percent",
            }).format(
              progress.stage === "compile"
                ? progress.compileProgress / 100
                : progress.bundleProgress / 100
            )}
            )
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 items-center">
          <Loader2 className="size-6 animate-spin" />

          <Progress
            value={
              progress.stage === "compile"
                ? progress.compileProgress
                : progress.bundleProgress
            }
          />
          <span className="text-sm text-gray-400">
            {progress.currentBundleFile ?? ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportButton;
