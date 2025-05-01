import { createExport, defaultProgress, ProgressUpdate } from "@/lib/export";
import { Slot } from "@radix-ui/react-slot";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Replace with actual icon imports
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";

function ExportDialog({ children }: { children: React.ReactNode }) {
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
      <Slot
        {...{ onClick: handleExport, disabled: mutation.isPending, children }}
      />
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
          <span className="text-sm text-gray-11">
            {progress.currentBundleFile ?? ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog;
