"use client";

import {
  ArrowRightToLine,
  FolderOpen,
  MoonStar,
  Plus,
  Save,
  Sun,
  Trash2,
} from "lucide-react";
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
import { loadFromFile } from "@/store/save";
import ExportDialog from "./ExportDialog";
import { ItemListList } from "./ItemList";
import { SaveDialog } from "./SaveDialog";
import { EditableText } from "./ui/editable-text";
import { Separator } from "./ui/separator";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { setOpen } = useSidebar();
  const projectName = useStore((state) => state.projectName);

  return (
    <Sidebar collapsible="icon" className="overflow-hidden flex-row" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger className="m-0.5 size-7 bg-gray-12 text-gray-1 grid place-items-center rounded-full shrink-0">
                <svg
                  className="w-4"
                  viewBox="0 0 91 54"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0.575 54L20 0.749997H26.75L46.1 54H40.55L34.85 38.025H11.825L6.125 54H0.575ZM13.55 33.075H33.125L23.375 5.325L13.55 33.075ZM51.9359 54V0.749997H70.6109C76.4109 0.749997 80.9609 2.175 84.2609 5.025C87.5609 7.825 89.2109 11.7 89.2109 16.65C89.2109 20.35 88.1609 23.475 86.0609 26.025C83.9609 28.575 80.9609 30.3 77.0609 31.2L90.1109 54H84.4859L71.8859 31.875C71.6859 31.925 71.4859 31.95 71.2859 31.95C71.0859 31.95 70.8609 31.95 70.6109 31.95H57.0359V54H51.9359ZM57.0359 27H70.6109C74.8609 27 78.1109 26.1 80.3609 24.3C82.6609 22.45 83.8109 19.85 83.8109 16.5C83.8109 13.05 82.6609 10.4 80.3609 8.55C78.1109 6.65 74.8609 5.7 70.6109 5.7H57.0359V27Z" />
                </svg>
              </TooltipTrigger>
              <TooltipContent>
                realm AR{" "}
                <span className="font-light tabular-nums">1.0 Beta</span>
              </TooltipContent>
            </Tooltip>
            <div className="flex-1 translate-y-0.5 text-sm font-medium">
              <EditableText
                value={projectName}
                onChange={(value) => {
                  useStore.getState().setProjectName(value || null);
                }}
                placeholder="Untitled Project"
                tooltip="Click to change project name"
              />
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
            <SaveDialog>
              <SidebarMenuButton
                tooltip={{ children: "Save" }}
                className="px-2.5 md:px-2"
              >
                <Save />
                Save
              </SidebarMenuButton>
            </SaveDialog>
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
              tooltip={{ children: "Reset" }}
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
              Reset
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ColorSchemeMenuButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ColorSchemeMenuButton() {
  const [colorScheme, setColorScheme] = useColorScheme();

  return (
    <SidebarMenuButton
      tooltip={{ children: "Color Scheme" }}
      className="px-2.5 md:px-2"
      onClick={() => {
        setColorScheme(colorScheme === "dark" ? "light" : "dark");
      }}
    >
      {colorScheme === "dark" ? <MoonStar /> : <Sun />}
      <span>Switch Color Scheme</span>
    </SidebarMenuButton>
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
