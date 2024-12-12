import { Images, Move3D, Scan } from "lucide-react";
import { ItemArrange } from "./ItemArrange";
import { ItemAssetList } from "./ItemAssetList";
import { ItemMarker } from "./ItemMarker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useStore } from "@/store";

export function ItemTabs() {
  const currentItemId = useStore((state) => state.currentItemId);
  const item = useStore((state) =>
    state.items.find((i) => i.id === currentItemId)
  );
  const setItem = useStore((state) => state.setItem);

  if (!item) return null;

  return (
    <Tabs
      defaultValue="arrange"
      value={item.editorSelectedTab}
      onValueChange={(value) =>
        setItem(item.id, {
          editorSelectedTab: value as "marker" | "assets" | "arrange",
        })
      }
    >
      <TabsList className="">
        <TabsTrigger value="marker">
          <Scan className="size-5 mr-3" />
          Marker
        </TabsTrigger>
        <TabsTrigger value="assetList">
          <Images className="size-5 mr-3" />
          Assets
        </TabsTrigger>
        <TabsTrigger value="arrange">
          <Move3D className="size-5 mr-3" />
          Arrange
        </TabsTrigger>
      </TabsList>
      <TabsContent value="marker" className="mt-6">
        <ItemMarker />
      </TabsContent>
      <TabsContent value="assetList">
        <ItemAssetList />
      </TabsContent>
      <TabsContent value="arrange" className="mt-0" asChild>
        <ItemArrange />
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
