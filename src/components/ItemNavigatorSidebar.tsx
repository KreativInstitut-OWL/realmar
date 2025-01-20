"use client";

import { Cog, Images, PlusIcon } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/store";
import { ItemListList } from "./ItemList";
import { Button } from "./ui/button";

export function ItemNavigatorSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSidebar();
  const addItem = useStore((state) => state.addItem);
  const editorCurrentTab = useStore((state) => state.editorCurrentTab);
  const setEditorCurrentTab = useStore((state) => state.setEditorCurrentTab);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <span className="mt-px text-primary">AR</span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: "AR Items",
                      hidden: false,
                    }}
                    onClick={() => {
                      setOpen(true);
                      setEditorCurrentTab("items");
                    }}
                    isActive={editorCurrentTab === "items"}
                    className="px-2.5 md:px-2"
                  >
                    <Images />
                    <span>AR Items</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{
                      children: "Settings",
                      hidden: false,
                    }}
                    onClick={() => {
                      setOpen(true);
                      setEditorCurrentTab("settings");
                    }}
                    isActive={editorCurrentTab === "settings"}
                    className="px-2.5 md:px-2"
                  >
                    <Cog />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">Items</div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                addItem();
              }}
            >
              <PlusIcon />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <ItemListList />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
