import { Marker } from "@/components/Marker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { AppState } from "@/schema";
import {
  ImagePlusIcon,
  ImagesIcon,
  Scan,
  Trash2Icon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import AlertDialogConfirmRemove from "./AlertDialogConfirmRemove";
import { AssetMetaForm } from "./AssetMetaForm";
import { ItemAssetFieldArray } from "./ItemAssetFieldArray";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ItemFields({
  itemIndex,
  onRemove,
}: {
  itemIndex: number;
  onRemove: () => void;
}) {
  const form = useFormContext<AppState>();

  const item = form.watch(`items.${itemIndex}`);

  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const handleRemove = () => {
    if (item.assets.length > 0) {
      setIsConfirmRemoveOpen(true);
    } else {
      onRemove();
    }
  };

  const handleRemoveConfirm = () => {
    onRemove();
    setIsConfirmRemoveOpen(false);
  };

  const handleRemoveCancel = () => {
    setIsConfirmRemoveOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Scan className="size-6" />
          <div className="text-lg font-semibold">
            {item.assets.length === 0 && "Empty"}
            {item.assets.length === 1 &&
              item.assets.at(0)?.file.type.startsWith("image/") &&
              "Image"}
            {item.assets.length === 1 &&
              !item.assets.at(0)?.file.type.startsWith("image/") &&
              "Other"}
            {item.assets.length > 1 && "Gallery"}
          </div>
          <Badge className="ml-auto">{item.id}</Badge>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Remove item"
            onClick={handleRemove}
          >
            <Trash2Icon />
          </Button>
          <AlertDialogConfirmRemove
            open={isConfirmRemoveOpen}
            onConfirm={handleRemoveConfirm}
            onCancel={handleRemoveCancel}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-12">
          <div className="">
            <DropzoneProvider
              multiple={false}
              accept={{ "image/*": [] }}
              preventDropOnDocument
              onDrop={(files) => {
                // set file as item.marker
                form.setValue(`items.${itemIndex}.marker`, files[0]);
              }}
            >
              <Dropzone className="group p-2 relative aspect-square">
                {item.marker ? (
                  <>
                    <img
                      src={URL.createObjectURL(item.marker)}
                      alt=""
                      className="object-contain w-full h-full"
                    />
                    <Badge className="absolute bottom-3 right-3 z-10">
                      Custom
                    </Badge>
                  </>
                ) : (
                  <>
                    <Marker id={item.id} />
                    <Badge className="absolute bottom-3 right-3 z-10">
                      Auto
                    </Badge>
                  </>
                )}
                <div className="absolute rounded-full p-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImagePlusIcon className="size-5" />
                </div>
                <DropzoneDragAcceptContent className="grid aspect-square place-items-center absolute inset-0 bg-white/70 backdrop-blur-sm">
                  Replace marker…
                </DropzoneDragAcceptContent>
              </Dropzone>
            </DropzoneProvider>
            {item.marker ? (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => {
                  // set marker as null
                  form.setValue(`items.${itemIndex}.marker`, null);
                }}
              >
                <XIcon className="size-4" />
                Remove custom marker
              </Button>
            ) : null}
          </div>

          <div className="col-span-5">
            <Tabs defaultValue="assets">
              <TabsList>
                <TabsTrigger value="assets">
                  <ImagesIcon className="size-5 mr-3" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <WrenchIcon className="size-5 mr-3" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="assets" className="mt-6">
                <ItemAssetFieldArray itemIndex={itemIndex} />
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <AssetMetaForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
