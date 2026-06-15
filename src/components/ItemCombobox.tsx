import { useStore } from "@/store";
import { Plus } from "lucide-react";
import * as React from "react";
import { ItemPreview } from "./ItemPreview";
import { Combobox, ComboboxTriggerButton } from "./ui/combobox";
import { CommandGroup, CommandItem, CommandSeparator } from "./ui/command";
import { useLanguage } from "@/LanguageProvider";

export function ItemComboboxEditorCurrentItem() {
  const editorCurrentItemId = useStore((state) => state.editorCurrentItemId);
  const setEditorCurrentItemId = useStore(
    (state) => state.setEditorCurrentItemId
  );
  const addItem = useStore((state) => state.addItem);
  const { t } = useLanguage();

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
              {t("addMarker")}
            </CommandItem>
          </CommandGroup>
        </>
      )}
    >
      <ItemComboboxTrigger />
    </ItemCombobox>
  );
}

export function ItemCombobox({
  disabledItemIds,
  ...props
}: Omit<
  React.ComponentProps<
    typeof Combobox<{ label: React.ReactNode; value: string }[]>
  >,
  "options"
> & {
  disabledItemIds?: Map<string, string>;
}) {
  const items = useStore((state) => state.items);
  const { t } = useLanguage();

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
      empty={t("noMarkerFound")}
      inputPlaceholder={t("searchMarker")}
      {...props}
    />
  );
}

export function ItemComboboxTrigger(
  props: React.ComponentProps<typeof ComboboxTriggerButton>
) {
  const { t } = useLanguage();
  return (
    <ComboboxTriggerButton
      aria-label={t("chooseMarker")}
      noValue={t("chooseMarkerPlaceholder")}
      {...props}
    />
  );
}
