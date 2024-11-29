import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CogIcon } from "lucide-react";
import { AssetMetaForm } from "./AssetMetaForm";
import { Button } from "./ui/button";

export function AssetMetaDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary">
          <CogIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asset Settings</DialogTitle>
        </DialogHeader>
        <AssetMetaForm />
      </DialogContent>
    </Dialog>
  );
}
