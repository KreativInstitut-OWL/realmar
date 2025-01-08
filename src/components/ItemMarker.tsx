import { getItemDefaultName } from "@/lib/item";
import { useCurrentItem, useStore } from "@/store";
import { ItemTarget } from "./ItemTarget";
import { FormDescription, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { ItemCombobox } from "./ItemCombobox";
import { Badge } from "./ui/badge";
import { CommandItem } from "./ui/command";
import { ItemPreview } from "./ItemPreview";

export function ItemMarker() {
  const item = useCurrentItem();
  const setItem = useStore((state) => state.setItem);
  const items = useStore((state) => state.items);

  if (!item) return null;

  return (
    <div className="p-8 grid 2xl:grid-cols-3 gap-8">
      <ItemTarget />
      <div className="2xl:col-span-2 flex flex-col gap-8">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormDescription>Optional name for the marker.</FormDescription>
          <Input
            onChange={(event) => {
              setItem(item.id, {
                name: event.target.value || null,
              });
            }}
            value={item.name || ""}
            placeholder={getItemDefaultName(item.index)}
          />
        </FormItem>
        <FormItem>
          <FormLabel>Dependency</FormLabel>
          <FormDescription>
            Enable this marker only after the marker it depends on has been
            detected / scanned.
          </FormDescription>

          <ItemCombobox
            onSelect={(itemId, close) => {
              setItem(item.id, {
                itemDependencyId: itemId,
              });
              close();
            }}
            value={item.itemDependencyId ?? undefined}
            triggerButtonProps={{
              variant: "input",
              className: "w-full max-w-none justify-between",
            }}
            disabledItemIds={
              new Map([
                [item.id, "This marker"],
                ...(items
                  .filter((i) => {
                    return i.id !== item.id && i.itemDependencyId === item.id;
                  })
                  .map((i) => [i.id, "Dependent marker"]) as [
                  string,
                  string
                ][]),
              ])
            }
            commandListChildren={(context) => (
              <CommandItem
                onSelect={() => {
                  setItem(item.id, {
                    itemDependencyId: null,
                  });
                  context.setOpen(false);
                }}
              >
                Clear dependency
              </CommandItem>
            )}
          />
          {/* a list of all items that have this item as a dependency */}
        </FormItem>
        <FormItem>
          <FormLabel>Dependents</FormLabel>
          <FormDescription>
            These markers will only be enabled after this marker has been
            detected / scanned. (Read-only)
          </FormDescription>
          <ul className="flex gap-2 flex-wrap">
            {items
              .filter((i) => i.itemDependencyId === item.id)
              .map((i) => (
                <li key={i.id}>
                  <Badge size="lg">
                    <ItemPreview id={i.id} />
                  </Badge>
                </li>
              ))}
          </ul>
        </FormItem>
      </div>
    </div>
  );
}
