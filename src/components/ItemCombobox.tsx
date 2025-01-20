import { useStore } from "@/store";
import { Plus } from "lucide-react";
import * as React from "react";
import { ItemPreview } from "./ItemPreview";
import { Combobox, ComboboxTriggerButton } from "./ui/combobox";
import { CommandGroup, CommandItem, CommandSeparator } from "./ui/command";

export function ItemComboboxEditorCurrentItem() {
  const editorCurrentItemId = useStore((state) => state.editorCurrentItemId);
  const setEditorCurrentItemId = useStore(
    (state) => state.setEditorCurrentItemId
  );
  const addItem = useStore((state) => state.addItem);

  return (
    <ItemCombobox
      value={editorCurrentItemId ?? undefined}
      onSelect={(itemId, close) => {
        setEditorCurrentItemId(itemId);
        close();
      }}
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
    />
  );
}

export function ItemCombobox({
  triggerButtonProps,
  disabledItemIds,
  ...props
}: Omit<
  React.ComponentProps<
    typeof Combobox<{ label: React.ReactNode; value: string }[]>
  >,
  "options"
> & {
  triggerButtonProps?: React.ComponentProps<typeof ComboboxTriggerButton>;
  disabledItemIds?: Map<string, string>;
}) {
  const items = useStore((state) => state.items);

  return (
    <Combobox
      options={items.map((item) => ({
        label: (
          <ItemPreview id={item.id}>
            {disabledItemIds?.has(item.id)
              ? ` (${disabledItemIds.get(item.id)})`
              : null}
          </ItemPreview>
        ),
        disabled: disabledItemIds?.has(item.id),
        value: item.id,
      }))}
      empty="No marker found."
      inputPlaceholder="Search marker..."
      {...props}
    >
      <ComboboxTriggerButton
        aria-label="Choose Marker"
        noValue="Choose Marker..."
        {...triggerButtonProps}
      />
    </Combobox>
  );
}
