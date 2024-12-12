import { Images, Move3D, Scan } from "lucide-react";
import { ItemArrange } from "./ItemArrange";
import { ItemEntities } from "./ItemEntities";
import { ItemTarget } from "./ItemTarget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useCurrentItem, useStore } from "@/store";
import { createPortal } from "react-dom";

export function ItemTabs({
  itemHeaderRef,
}: {
  itemHeaderRef: React.RefObject<HTMLLIElement>;
}) {
  const item = useCurrentItem();
  const setItem = useStore((state) => state.setItem);

  if (!item) return null;

  return (
    <Tabs
      defaultValue="arrange"
      value={item.editorCurrentTab}
      onValueChange={(value) =>
        setItem(item.id, {
          editorCurrentTab: value as "target" | "entities" | "arrange",
        })
      }
    >
      {createPortal(
        <TabsList className="">
          <TabsTrigger value="target">
            <Scan className="size-5 mr-3" />
            Target
          </TabsTrigger>
          <TabsTrigger value="entities">
            <Images className="size-5 mr-3" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="arrange">
            <Move3D className="size-5 mr-3" />
            Arrange
          </TabsTrigger>
        </TabsList>,
        itemHeaderRef.current!
      )}
      <TabsContent value="target" className="mt-6">
        <ItemTarget />
      </TabsContent>
      <TabsContent value="entities">
        <ItemEntities />
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
