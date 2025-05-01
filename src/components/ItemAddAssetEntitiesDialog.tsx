import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Item, useStore } from "@/store";
import { useState } from "react";
import { AssetDropzone } from "./AssetDropzone";
import { AssetList } from "./AssetList";
import { Button } from "./ui/button";

export default function ItemAddAssetEntitiesDialog({
  children,
  item,
}: {
  children: React.ReactNode;
  item: Item;
}) {
  const addAssetsFromFiles = useStore((state) => state.addAssetsFromFiles);
  const addItemEntitiesFromAssetIds = useStore(
    (state) => state.addItemEntitiesFromAssetIds
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Asset Entities to Marker</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-12">
          <div className="pt-8 px-12">
            <AssetDropzone
              className="h-48"
              onFiles={async (files) => {
                await addAssetsFromFiles(files);
              }}
            />
          </div>
          <AssetList
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              disabled={selectedIds.length === 0}
              onClick={() => {
                console.log(
                  "Adding entities from assets",
                  selectedIds,
                  item.id
                );
                addItemEntitiesFromAssetIds(item.id, selectedIds);
              }}
            >
              Add {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "Entity" : "Entities"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
