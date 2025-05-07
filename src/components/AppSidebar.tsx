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
              <TooltipContent className="flex items-center h-7">
                <span className="sr-only">realm AR</span>
                <svg
                  className="h-3"
                  viewBox="0 0 366 73"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0.5 71V17.8H10.2L10.6 31.9L9.7 31.6C10.4333 26.8 11.9 23.3 14.1 21.1C16.3667 18.9 19.4 17.8 23.2 17.8H28.3V27.3H23.2C20.5333 27.3 18.3 27.7333 16.5 28.6C14.7 29.4667 13.3333 30.8 12.4 32.6C11.5333 34.4 11.1 36.7333 11.1 39.6V71H0.5ZM57.7516 72.2C52.5516 72.2 48.0516 71.0667 44.2516 68.8C40.5182 66.5333 37.6182 63.3 35.5516 59.1C33.5516 54.9 32.5516 50 32.5516 44.4C32.5516 38.8 33.5516 33.9333 35.5516 29.8C37.6182 25.6 40.5182 22.3667 44.2516 20.1C47.9849 17.7667 52.3849 16.6 57.4516 16.6C62.2516 16.6 66.4849 17.7333 70.1516 20C73.8182 22.2 76.6516 25.4 78.6516 29.6C80.7182 33.8 81.7516 38.8667 81.7516 44.8V47.5H43.5516C43.8182 52.7 45.1849 56.6 47.6516 59.2C50.1849 61.8 53.5849 63.1 57.8516 63.1C60.9849 63.1 63.5849 62.3667 65.6516 60.9C67.7182 59.4333 69.1516 57.4667 69.9516 55L80.9516 55.7C79.5516 60.6333 76.7849 64.6333 72.6516 67.7C68.5849 70.7 63.6182 72.2 57.7516 72.2ZM43.5516 39.5H70.5516C70.2182 34.7667 68.8516 31.2667 66.4516 29C64.1182 26.7333 61.1182 25.6 57.4516 25.6C53.6516 25.6 50.5182 26.8 48.0516 29.2C45.6516 31.5333 44.1516 34.9667 43.5516 39.5ZM107.966 72.2C102.433 72.2 97.9997 70.9333 94.6664 68.4C91.3997 65.8667 89.7664 62.3 89.7664 57.7C89.7664 53.1 91.1331 49.5333 93.8664 47C96.6664 44.4 100.966 42.5333 106.766 41.4L125.066 37.9C125.066 33.7667 124.1 30.7 122.166 28.7C120.233 26.6333 117.366 25.6 113.566 25.6C110.166 25.6 107.5 26.3667 105.566 27.9C103.633 29.3667 102.3 31.5667 101.566 34.5L90.6664 33.8C91.6664 28.4667 94.1331 24.2667 98.0664 21.2C102.066 18.1333 107.233 16.6 113.566 16.6C120.766 16.6 126.233 18.5333 129.966 22.4C133.766 26.2 135.666 31.5667 135.666 38.5V71H126.266L125.866 59.2L126.866 59.6C126.4 62.0667 125.266 64.2333 123.466 66.1C121.666 67.9667 119.4 69.4667 116.666 70.6C114 71.6667 111.1 72.2 107.966 72.2ZM109.666 63.8C112.866 63.8 115.6 63.2 117.866 62C120.133 60.7333 121.9 59 123.166 56.8C124.433 54.6 125.066 52.1 125.066 49.3V45.9L109.466 48.9C106.266 49.5 104 50.4667 102.666 51.8C101.4 53.0667 100.766 54.7 100.766 56.7C100.766 58.9667 101.533 60.7333 103.066 62C104.666 63.2 106.866 63.8 109.666 63.8ZM149.819 71V-3.8147e-06H160.419V71H149.819ZM175.43 71V17.8H185.13L185.43 31L184.23 30.6C184.83 27.6667 185.863 25.1667 187.33 23.1C188.863 21.0333 190.73 19.4333 192.93 18.3C195.13 17.1667 197.53 16.6 200.13 16.6C204.663 16.6 208.363 17.9 211.23 20.5C214.096 23.0333 215.896 26.5333 216.63 31H214.93C215.53 27.8667 216.53 25.2667 217.93 23.2C219.396 21.0667 221.263 19.4333 223.53 18.3C225.796 17.1667 228.363 16.6 231.23 16.6C234.963 16.6 238.13 17.4 240.73 19C243.396 20.5333 245.396 22.8 246.73 25.8C248.13 28.8 248.83 32.4667 248.83 36.8V71H238.23V39.4C238.23 34.8 237.396 31.3333 235.73 29C234.063 26.6667 231.53 25.5 228.13 25.5C225.93 25.5 223.996 26.0667 222.33 27.2C220.663 28.3333 219.363 29.9667 218.43 32.1C217.563 34.2333 217.13 36.8 217.13 39.8V71H207.03V39.8C207.03 35.2667 206.263 31.7667 204.73 29.3C203.263 26.7667 200.73 25.5 197.13 25.5C194.863 25.5 192.896 26.0667 191.23 27.2C189.63 28.3333 188.363 30 187.43 32.2C186.496 34.3333 186.03 36.8667 186.03 39.8V71H175.43ZM275.981 71L295.406 17.75H302.156L321.506 71H315.956L310.256 55.025H287.231L281.531 71H275.981ZM288.956 50.075H308.531L298.781 22.325L288.956 50.075ZM327.342 71V17.75H346.017C351.817 17.75 356.367 19.175 359.667 22.025C362.967 24.825 364.617 28.7 364.617 33.65C364.617 37.35 363.567 40.475 361.467 43.025C359.367 45.575 356.367 47.3 352.467 48.2L365.517 71H359.892L347.292 48.875C347.092 48.925 346.892 48.95 346.692 48.95C346.492 48.95 346.267 48.95 346.017 48.95H332.442V71H327.342ZM332.442 44H346.017C350.267 44 353.517 43.1 355.767 41.3C358.067 39.45 359.217 36.85 359.217 33.5C359.217 30.05 358.067 27.4 355.767 25.55C353.517 23.65 350.267 22.7 346.017 22.7H332.442V44Z" />
                </svg>
                <span className="font-light tabular-nums ps-[1ch] translate-y-px">
                  1.0 Beta
                </span>
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
