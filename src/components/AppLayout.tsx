import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import ExportButton from "./ExportButton";
import { ItemComboboxEditorCurrentItem } from "./ItemCombobox";
import { ItemListRoot } from "./ItemList";
import { AppSidebar } from "./AppSidebar";
import { LoadButton } from "./LoadButton";
import { MainView } from "./MainView";
import { SaveButton } from "./SaveButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useStore } from "@/store";

function AppLayout() {
  const [itemHeader, setItemHeader] = useState<HTMLLIElement | null>(null);
  const editorCurrentView = useStore((state) => state.editorCurrentView);

  return (
    <ItemListRoot>
      <SidebarProvider
        style={{ "--sidebar-width": "350px" } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-white px-4 h-16 z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Breadcrumb>
              {editorCurrentView === "settings" ? (
                <BreadcrumbList>
                  <BreadcrumbItem>Settings</BreadcrumbItem>
                </BreadcrumbList>
              ) : editorCurrentView === "preview" ? (
                <BreadcrumbList>
                  <BreadcrumbItem>Preview</BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem ref={(element) => setItemHeader(element)} />
                </BreadcrumbList>
              ) : (
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <ItemComboboxEditorCurrentItem />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem ref={(element) => setItemHeader(element)} />
                </BreadcrumbList>
              )}
            </Breadcrumb>

            <ExportButton />
            <SaveButton />
            <LoadButton />
          </header>

          <MainView itemHeader={itemHeader} />
        </SidebarInset>
      </SidebarProvider>
    </ItemListRoot>
  );
}

export default AppLayout;
