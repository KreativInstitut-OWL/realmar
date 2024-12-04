import { GeneratedMarker } from "@/components/GeneratedMarker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneDragAcceptContent,
  DropzoneProvider,
} from "@/components/ui/dropzone";
import { ImagePlusIcon, Images, Move3D, Scan, XIcon } from "lucide-react";
import { useAppState } from "./AppState";
import Item3dEditor from "./Item3dEditor";
import { ItemAssetList } from "./ItemAssetList";
import { ItemFieldsArrange } from "./ItemFieldsArrange";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ItemTabs({ itemIndex }: { itemIndex: number }) {
  const form = useAppState();

  const item = form.watch(`items.${itemIndex}`);

  return (
    <Tabs defaultValue="transform">
      <TabsList className="w-full justify-start px-4">
        <TabsTrigger value="assets">
          <Images className="size-5 mr-3" />
          Assets
        </TabsTrigger>
        <TabsTrigger value="transform">
          <Move3D className="size-5 mr-3" />
          Arrange
        </TabsTrigger>
        <TabsTrigger value="marker">
          <Scan className="size-5 mr-3" />
          Marker
        </TabsTrigger>
      </TabsList>
      <TabsContent value="marker" className="mt-6">
        <div className="grid grid-cols-3">
          <DropzoneProvider
            multiple={false}
            accept={{ "image/*": [] }}
            preventDropOnDocument
            onDrop={(files) => {
              // set file as item.marker
              form.setValue(`items.${itemIndex}.marker`, files[0]);
            }}
          >
            <Dropzone className="group p-2 relative aspect-square col-span-1">
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
                  <GeneratedMarker id={item.id} />
                  <Badge className="absolute bottom-3 right-3 z-10">Auto</Badge>
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
      </TabsContent>
      <TabsContent value="assets">
        <ItemAssetList itemIndex={itemIndex} />
      </TabsContent>
      <TabsContent
        value="transform"
        className="mt-0 h-[calc(100lvh-101px)] relative"
      >
        <Item3dEditor
          assets={item.assets}
          marker={item.marker}
          id={item.id}
          lookAt={
            form.watch(`items.${itemIndex}.lookAt`) === "camera"
              ? "camera"
              : undefined
          }
          rotation={form.watch(`items.${itemIndex}.rotation`)}
          position={form.watch(`items.${itemIndex}.position`)}
          scale={form.watch(`items.${itemIndex}.scale`)}
          onPositionChange={({ x, y, z }) => {
            form.setValue(`items.${itemIndex}.position.x`, x);
            form.setValue(`items.${itemIndex}.position.y`, y);
            form.setValue(`items.${itemIndex}.position.z`, z);
          }}
          onRotationChange={({ x, y, z }) => {
            form.setValue(`items.${itemIndex}.rotation.x`, x);
            form.setValue(`items.${itemIndex}.rotation.y`, y);
            form.setValue(`items.${itemIndex}.rotation.z`, z);
          }}
          onScaleChange={({ x, y, z }) => {
            if (form.getValues(`items.${itemIndex}.isUniformScale`)) {
              const prevScale = form.getValues(`items.${itemIndex}.scale`);
              const didXChange = prevScale.x !== x;
              const didYChange = prevScale.y !== y;
              const value = didXChange ? x : didYChange ? y : z;
              form.setValue(
                `items.${itemIndex}.scale.x` as `items.${number}.rotation.x`,
                value
              );
              form.setValue(
                `items.${itemIndex}.scale.y` as `items.${number}.rotation.y`,
                value
              );
              form.setValue(
                `items.${itemIndex}.scale.z` as `items.${number}.rotation.z`,
                value
              );
              return;
            }
            form.setValue(`items.${itemIndex}.scale.x`, x);
            form.setValue(`items.${itemIndex}.scale.y`, y);
            form.setValue(`items.${itemIndex}.scale.z`, z);
          }}
          shouldPlayAnimation={form.watch(
            `items.${itemIndex}.shouldPlayAnimation`
          )}
        />

        <div className="absolute top-2 right-2 w-96">
          <ItemFieldsArrange itemIndex={itemIndex} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

/**
 * 
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
 
      <CardHeader>
        <div className="flex items-center gap-2">
          <Scan className="size-6" />

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

 */
