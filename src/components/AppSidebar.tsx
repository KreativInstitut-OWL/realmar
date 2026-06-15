"use client";

import {
  ArrowRightToLine,
  FolderOpen,
  Merge,
  MoonStar,
  Plus,
  Save,
  Sun,
  Trash2,
  Languages,
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
import { useColorScheme } from "@/hooks/useColorScheme";
import { useStore } from "@/store";
import { loadFromFile, mergeFromFile } from "@/store/save";
import ExportDialog from "./ExportDialog";
import { ItemListList } from "./ItemList";
import { SaveDialog } from "./SaveDialog";
import SplashScreenDialog from "./SplashScreenDialog";
import { EditableText } from "./ui/editable-text";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { RealmArLogo } from "./RealmArLogo";
import { useLanguage } from "@/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { setOpen } = useSidebar();
  const projectName = useStore((state) => state.projectName);
  const { t } = useLanguage();

  return (
    <Sidebar collapsible="icon" className="overflow-hidden flex-row" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-4">
            <Tooltip>
              <SplashScreenDialog>
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
              </SplashScreenDialog>
              <TooltipContent className="h-7">
                About <RealmArLogo inline />
              </TooltipContent>
            </Tooltip>
            <div className="flex-1 translate-y-0.5 text-sm font-medium">
              <EditableText
                value={projectName}
                onChange={(value) => {
                  useStore.getState().setProjectName(value || null);
                }}
                placeholder={t("untitledProject")}
                tooltip={t("clickToChangeProjectName")}
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
                tooltip={{ children: t("export") }}
                className="px-2.5 md:px-2"
              >
                <ArrowRightToLine />
                {t("export")}
              </SidebarMenuButton>
            </ExportDialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SaveDialog>
              <SidebarMenuButton
                tooltip={{ children: t("save") }}
                className="px-2.5 md:px-2"
              >
                <Save />
                {t("save")}
              </SidebarMenuButton>
            </SaveDialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: t("load") }}
              className="px-2.5 md:px-2"
              onClick={() => {
                loadFromFile();
              }}
            >
              <FolderOpen />
              {t("load")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: t("mergeIntoProject") }}
              className="px-2.5 md:px-2"
              onClick={() => {
                mergeFromFile();
              }}
            >
              <Merge />
              {t("mergeIntoProject")}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={{ children: t("reset") }}
              className="px-2.5 md:px-2"
              onClick={() => {
                if (
                  confirm(t("resetWarning"))
                ) {
                  useStore.getState().reset();
                }
              }}
            >
              <Trash2 />
              {t("reset")}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ColorSchemeMenuButton />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LanguageMenuButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ColorSchemeMenuButton() {
  const [colorScheme, setColorScheme] = useColorScheme();
  const { t } = useLanguage();

  return (
    <SidebarMenuButton
      tooltip={{ children: t("colorScheme") }}
      className="px-2.5 md:px-2"
      onClick={() => {
        setColorScheme(colorScheme === "dark" ? "light" : "dark");
      }}
    >
      {colorScheme === "dark" ? <MoonStar /> : <Sun />}
      <span>{t("switchColorScheme")}</span>
    </SidebarMenuButton>
  );
}

function LanguageMenuButton() {
  const { language, setLanguage } = useLanguage();

  const langs = {
    en: "English",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    ar: "العربية",
    hi: "हिन्दी",
    zh: "中文",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip={{ children: "Change Language / Sprache ändern" }}
          className="px-2.5 md:px-2"
        >
          <Languages />
          <span>{langs[language as keyof typeof langs] || "Language"}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        {Object.entries(langs).map(([code, name]) => (
          <DropdownMenuItem key={code} onClick={() => setLanguage(code)}>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppSidebarMenu() {
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const setEditorCurrentView = useStore((state) => state.setEditorCurrentView);
  const addItem = useStore((state) => state.addItem);
  const { state } = useSidebar();
  const { t } = useLanguage();

  return (
    <SidebarMenu>
      {(Object.entries(editorView) as [EditorView, string][]).map(
        ([key]) => (
          <SidebarMenuItem key={key}>
            <SidebarMenuButton
              tooltip={{ children: t(`view_${key}`) }}
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
              <span>{t(`view_${key}`)}</span>
            </SidebarMenuButton>

            {key === "items" && (
              <>
                <SidebarMenuAction onClick={() => addItem()}>
                  <Plus />
                  <span className="sr-only">{t("addMarker")}</span>
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
