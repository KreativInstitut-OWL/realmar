"use client";

import { ArrowRightToLine, FolderOpen, Plus, Save, Trash2 } from "lucide-react";
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
import { EditorView, editorView, editorViewIcon } from "@/const/editorView";
import { useStore } from "@/store";
import { loadFromFile, save } from "@/store/save";
import ExportDialog from "./ExportDialog";
import { ItemListList } from "./ItemList";
import { Separator } from "./ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { setOpen } = useSidebar();
  const projectName = useStore((state) => state.projectName);

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
            <AppSidebarMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <ExportDialog>
              <SidebarMenuButton
                tooltip={{ children: "Export" }}
                className="px-2.5 md:px-2"
              >
                <ArrowRightToLine />
                Export
              </SidebarMenuButton>
            </ExportDialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: "Save" }}
              className="px-2.5 md:px-2"
              onClick={() => {
                save();
              }}
            >
              <Save />
              Save
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: "Load" }}
              className="px-2.5 md:px-2"
              onClick={() => {
                loadFromFile();
              }}
            >
              <FolderOpen />
              Load
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: "Load" }}
              className="px-2.5 md:px-2"
              onClick={() => {
                if (
                  confirm("Resetting will delete all your data. Are you sure?")
                ) {
                  useStore.getState().reset();
                }
              }}
            >
              <Trash2 />
              Zurücksetzen
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppSidebarMenu() {
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const setEditorCurrentView = useStore((state) => state.setEditorCurrentView);
  const addItem = useStore((state) => state.addItem);
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      {(Object.entries(editorView) as [EditorView, string][]).map(
        ([key, label]) => (
          <SidebarMenuItem key={key}>
            <SidebarMenuButton
              tooltip={{ children: label }}
              onClick={() => {
                setEditorCurrentView(key);
              }}
              isActive={
                editorCurrentView === key &&
                !(key === "items" && state === "expanded")
              }
              className="px-2.5 md:px-2"
            >
              {editorViewIcon[key]}
              <span>{label}</span>
            </SidebarMenuButton>

            {key === "items" && (
              <>
                <SidebarMenuAction onClick={() => addItem()}>
                  <Plus />
                  <span className="sr-only">Add Marker</span>
                </SidebarMenuAction>
                <ItemListList />
              </>
            )}
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}
