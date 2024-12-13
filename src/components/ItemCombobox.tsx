import { useStore } from "@/store";
import { Plus } from "lucide-react";
import { Target } from "./Target";
import { Combobox, ComboboxTriggerButton } from "./ui/combobox";
import { CommandGroup, CommandItem, CommandSeparator } from "./ui/command";

export function ItemCombobox() {
  const items = useStore((state) => state.items);
  const currentItemId = useStore((state) => state.currentItemId);
  const setCurrentItemId = useStore((state) => state.setCurrentItemId);
  const addItem = useStore((state) => state.addItem);

  return (
    <Combobox
      options={items.map((item, index) => ({
        label: (
          <div className="inline-flex items-center gap-2">
            <Target
              itemId={item.id}
              assetId={item.targetAssetId}
              className="size-4"
            />
            {item.editorName ?? `Marker ${index + 1}`}
          </div>
        ),
        value: item.id,
      }))}
      value={currentItemId ?? undefined}
      onSelect={(itemId, close) => {
        setCurrentItemId(itemId);
        close();
      }}
      empty="No marker found."
      inputPlaceholder="Search marker..."
      commandListChildren={(context) => (
        <>
          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                addItem(true);
                context.setOpen(false);
              }}
            >
              <Plus className="size-4" />
              Add Marker
            </CommandItem>
          </CommandGroup>
        </>
      )}
    >
      <ComboboxTriggerButton aria-label="Choose Marker" />
    </Combobox>
  );
}
