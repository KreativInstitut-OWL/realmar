import { Images, Move3D, Scan } from "lucide-react";
import { ItemArrange } from "./ItemArrange";
import { ItemAssetList } from "./ItemAssetList";
import { ItemMarker } from "./ItemMarker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ItemTabs({ itemIndex }: { itemIndex: number }) {
  return (
    <Tabs defaultValue="arrange">
      <TabsList className="">
        <TabsTrigger value="assetList">
          <Images className="size-5 mr-3" />
          Assets
        </TabsTrigger>
        <TabsTrigger value="arrange">
          <Move3D className="size-5 mr-3" />
          Arrange
        </TabsTrigger>
        <TabsTrigger value="marker">
          <Scan className="size-5 mr-3" />
          Marker
        </TabsTrigger>
      </TabsList>
      <TabsContent value="marker" className="mt-6">
        <ItemMarker itemIndex={itemIndex} />
      </TabsContent>
      <TabsContent value="assetList">
        <ItemAssetList itemIndex={itemIndex} />
      </TabsContent>
      <TabsContent value="arrange" className="mt-0" asChild>
        <ItemArrange itemIndex={itemIndex} />
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
