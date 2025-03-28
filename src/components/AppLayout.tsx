import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useStore } from "@/store";
import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { EditorViewComboboxEditorCurrentView } from "./EditorViewCombobox";
import { ItemComboboxEditorCurrentItem } from "./ItemCombobox";
import { MainView } from "./MainView";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

function AppLayout() {
  const [itemHeader, setItemHeader] = useState<HTMLLIElement | null>(null);
  const editorCurrentView = useStore((state) => state.editorCurrentView);

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "320px" } as React.CSSProperties}
      className="[--header-height:64px]"
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-gray-1 px-4 h-(--header-height) z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <EditorViewComboboxEditorCurrentView />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {editorCurrentView === "items" ? (
                <>
                  <BreadcrumbItem>
                    <ItemComboboxEditorCurrentItem />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : null}
              <BreadcrumbItem ref={(element) => setItemHeader(element)} />
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <MainView itemHeader={itemHeader} />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
