"use client";

import { Cog, Images, Plus, ScanEye } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/store";
import ExportButton from "./ExportButton";
import { ItemListList } from "./ItemList";
import { LoadButton } from "./LoadButton";
import { SaveButton } from "./SaveButton";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSidebar();
  const projectName = useStore((state) => state.projectName);
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const setEditorCurrentView = useStore((state) => state.setEditorCurrentView);
  const addItem = useStore((state) => state.addItem);

  return (
    <Sidebar collapsible="icon" className="overflow-hidden flex-row" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-3">
            <img src="/logo.svg" alt="BatchAR" className="size-8 max-w-none" />
            <div className="flex-1 text-left truncate translate-y-0.5 text-base font-[Inter] font-normal">
              {projectName}
            </div>
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
                    children: "Markers",
                    hidden: false,
                  }}
                  onClick={() => {
                    setOpen(true);
                    setEditorCurrentView("items");
                  }}
                  isActive={editorCurrentView === "items"}
                  className="px-2.5 md:px-2"
                >
                  <Images />
                  <span>Markers</span>
                </SidebarMenuButton>
                <SidebarMenuAction onClick={() => addItem()}>
                  <Plus />
                  <span className="sr-only">Add Marker</span>
                </SidebarMenuAction>

                <ItemListList />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: "Settings",
                    hidden: false,
                  }}
                  onClick={() => {
                    setOpen(true);
                    setEditorCurrentView("settings");
                  }}
                  isActive={editorCurrentView === "settings"}
                  className="px-2.5 md:px-2"
                >
                  <Cog />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: "Preview",
                    hidden: false,
                  }}
                  onClick={() => {
                    setOpen(true);
                    setEditorCurrentView("preview");
                  }}
                  isActive={editorCurrentView === "preview"}
                  className="px-2.5 md:px-2"
                >
                  <ScanEye />
                  <span>Preview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="grid grid-cols-2 gap-1">
          <SaveButton />
          <LoadButton />
        </div>
        <ExportButton />
      </SidebarFooter>
    </Sidebar>
  );
}
