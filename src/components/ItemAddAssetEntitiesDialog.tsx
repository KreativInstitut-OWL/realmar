import {
  Dialog,
  DialogClose,
  DialogCloseX,
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
          <DialogCloseX />
        </DialogHeader>
        <div className="grid gap-12">
          <div className="pt-8 px-12">
            <AssetDropzone
              className="h-36"
              onFiles={async (files) => {
                await addAssetsFromFiles(files);
              }}
            />
          </div>
          <p className="text-sm text-gray-11 -mb-6 max-w-prose">
            Select the assets you want to add to the marker and then click "Add
            assets" to add them to the marker as entities. You can select
            multiple assets by holding the Ctrl (Windows) or Command (Mac) key
            while clicking on them.
          </p>
          <AssetList
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="default"
              disabled={selectedIds.length === 0}
              onClick={() => {
                // console.log(
                //   "Adding entities from assets",
                //   selectedIds,
                //   item.id
                // );
                addItemEntitiesFromAssetIds(item.id, selectedIds);
              }}
            >
              {selectedIds.length > 0 ? (
                <>
                  Add {selectedIds.length}{" "}
                  {selectedIds.length === 1 ? "asset" : "assets"}
                </>
              ) : (
                <>Select asset(s) to add</>
              )}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
