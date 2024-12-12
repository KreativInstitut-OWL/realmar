import { useStore } from "@/store";
import { Combobox, ComboboxTriggerButton } from "./ui/combobox";

export function ItemCombobox() {
  const items = useStore((state) => state.items);
  const currentItemId = useStore((state) => state.currentItemId);
  const setCurrentItemId = useStore((state) => state.setCurrentItemId);

  return (
    <Combobox
      options={items.map((item, index) => ({
        label: `Marker ${index + 1}`,
        value: item.id,
      }))}
      value={currentItemId ?? undefined}
      onSelect={(itemId, close) => {
        setCurrentItemId(itemId);
        close();
      }}
      empty="Kein Marker gefunden."
      inputPlaceholder="Marker suchen…"
    >
      <ComboboxTriggerButton aria-label="Marker auswählen" />
    </Combobox>
  );
}
