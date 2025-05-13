import { save } from "@/store/save";
import { Slot } from "@radix-ui/react-slot";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Replace with actual icon imports
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { useStore } from "@/store";

export function SaveDialog({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<number>(0);
  const hasItems = useStore((state) => state.items.length > 0);
  const hasAssets = useStore((state) => state.assets.length > 0);
  const canSave = hasItems || hasAssets;

  const mutation = useMutation({
    mutationKey: ["save"],
    mutationFn: save,
    onSuccess(data) {
      if (data) {
        toast.success("Saved project as " + data);
      }
    },
    onError(error) {
      toast.error("Save failed");
      console.error(error);
    },
  });

  const handleSave = useCallback(() => {
    mutation.mutate((progress) => setProgress(progress));
  }, [mutation]);

  return (
    <Dialog open={mutation.isPending}>
      <Slot
        {...{
          onClick: handleSave,
          disabled: mutation.isPending || !canSave,
          children,
        }}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Saving project… (
            {new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              style: "percent",
            }).format(progress)}
            )
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 items-center">
          <Loader2 className="size-6 animate-spin" />

          <Progress value={progress} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
