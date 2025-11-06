import { getItemDefaultName } from "@/lib/item";
import { useCurrentItem, useStore } from "@/store";
import { ItemCombobox, ItemComboboxTrigger } from "./ItemCombobox";
import { ItemPreview } from "./ItemPreview";
import { ItemTarget } from "./ItemTarget";
import { Badge } from "./ui/badge";
import { CommandItem } from "./ui/command";
import { ControlGroup, ControlLabel, ControlRow } from "./ui/control";
import { FormControl, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SidebarGroup, SidebarGroupContent } from "./ui/sidebar";

export function ItemMarker() {
  const item = useCurrentItem();
  const setItem = useStore((state) => state.setItem);
  const items = useStore((state) => state.items);

  if (!item) return null;

  return (
    <div>
      <ItemTarget />
      <div className="2xl:col-span-2 flex flex-col gap-8">
        <SidebarGroup>
          <SidebarGroupContent>
            <ControlGroup>
              <ControlLabel level={2}>Settings</ControlLabel>
              <FormItem asChild>
                <ControlRow columns={3}>
                  <FormLabel>Name</FormLabel>
                  <FormControl className="col-span-2">
                    <Input
                      type="text"
                      onChange={(event) => {
                        setItem(item.id, {
                          name: event.target.value || null,
                        });
                      }}
                      value={item.name || ""}
                      placeholder={getItemDefaultName(item.index)}
                    />
                  </FormControl>
                </ControlRow>
              </FormItem>
              <FormItem asChild>
                <ControlRow columns={3}>
                  <FormLabel>Display Mode</FormLabel>
                  <Select
                    onValueChange={(
                      newDisplayMode: (typeof item)["displayMode"]
                    ) => {
                      setItem(item.id, {
                        displayMode: newDisplayMode,
                      });
                    }}
                    defaultValue={item.displayMode}
                  >
                    <FormControl className="col-span-2">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a display mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scene">
                        Scene (All entities at once)
                      </SelectItem>
                      <SelectItem value="gallery">
                        Gallery (Every entity one-by-one)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </ControlRow>
              </FormItem>
            </ControlGroup>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <ControlGroup>
              <ControlLabel level={2}>Dependencies</ControlLabel>
              <FormItem asChild>
                <ControlRow columns={3}>
                  <FormLabel>Dependency</FormLabel>
                  <ItemCombobox
                    onSelect={(itemId, close) => {
                      setItem(item.id, {
                        itemDependencyId: itemId,
                      });
                      close();
                    }}
                    value={item.itemDependencyId ?? undefined}
                    disabledItemIds={
                      new Map([
                        [item.id, "This marker"],
                        ...(items
                          .filter((i) => {
                            return (
                              i.id !== item.id && i.itemDependencyId === item.id
                            );
                          })
                          .map((i) => [i.id, "Dependent marker"]) as [
                          string,
                          string,
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
                  >
                    <FormControl className="col-span-2">
                      <ItemComboboxTrigger
                        className="w-full max-w-none justify-between"
                        variant="input"
                      />
                    </FormControl>
                  </ItemCombobox>
                </ControlRow>
              </FormItem>
              <FormItem asChild>
                <ControlRow columns={3}>
                  <FormLabel>Dependents</FormLabel>
                  <ul className="flex gap-2 flex-wrap">
                    {items
                      .filter((i) => i.itemDependencyId === item.id)
                      .map((i) => (
                        <li key={i.id}>
                          <Badge>
                            <ItemPreview id={i.id} />
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </ControlRow>
              </FormItem>
            </ControlGroup>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <ControlGroup>
              <ControlLabel level={2}>Link</ControlLabel>
              <FormItem asChild>
                <ControlRow columns={3}>
                  <FormLabel className="col-span-1">Add Link</FormLabel>
                  <FormControl>
                    <Switch
                      onCheckedChange={(enabled) => {
                        setItem(item.id, {
                          link: enabled
                            ? {
                                url: item.link?.url || "",
                                title: item.link?.title || "",
                                enabled: true,
                              }
                            : null,
                        });
                      }}
                      checked={item.link !== null}
                    />
                  </FormControl>
                </ControlRow>
              </FormItem>
              {item.link?.enabled ? (
                <>
                  <FormItem asChild>
                    <ControlRow columns={3}>
                      <FormLabel>Title</FormLabel>
                      <FormControl className="col-span-2">
                        <Input
                          type="text"
                          onChange={(event) => {
                            setItem(item.id, {
                              link: {
                                url: item.link?.url || "",
                                title: event.target.value || "",
                                enabled: item.link?.enabled ?? true,
                              },
                            });
                          }}
                          value={item.link?.title || ""}
                          placeholder="Enter link title"
                        />
                      </FormControl>
                    </ControlRow>
                  </FormItem>
                  <FormItem asChild>
                    <ControlRow columns={3}>
                      <FormLabel>URL</FormLabel>
                      <FormControl className="col-span-2">
                        <Input
                          type="url"
                          onChange={(event) => {
                            setItem(item.id, {
                              link: {
                                url: event.target.value || "",
                                title: item.link?.title || "",
                                enabled: item.link?.enabled ?? true,
                              },
                            });
                          }}
                          value={item.link?.url || ""}
                          placeholder="https://example.com"
                        />
                      </FormControl>
                    </ControlRow>
                  </FormItem>
                </>
              ) : null}
            </ControlGroup>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    </div>
  );
}
