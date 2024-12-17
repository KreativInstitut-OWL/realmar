import { FolderOpen, Save } from "lucide-react";
import { Button } from "./ui/button";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { load, save } from "@/store/save";
import { Suspense, useRef } from "react";
import ExportButton from "./ExportButton";
import { ItemCombobox } from "./ItemCombobox";
import { ItemListRoot, ItemListSelectedItemContent } from "./ItemList";
import { ItemNavigatorSidebar } from "./ItemNavigatorSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

function AppLayout() {
  const itemHeaderRef = useRef<HTMLLIElement>(null);

  return (
    <ItemListRoot>
      <SidebarProvider
        style={{ "--sidebar-width": "350px" } as React.CSSProperties}
      >
        <ItemNavigatorSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-white px-4 h-16 z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <ItemCombobox />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem ref={itemHeaderRef} />
              </BreadcrumbList>
            </Breadcrumb>

            <ExportButton />

            <Button
              variant="secondary"
              onClick={() => {
                save();
              }}
            >
              Save
              <Save />
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                // ask for file
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".batchar";
                input.onchange = () => {
                  const files = input.files;
                  if (files && files.length > 0) {
                    load(files[0]);
                  }
                };
                input.click();
              }}
            >
              Load
              <FolderOpen />
            </Button>
          </header>

          <Suspense fallback="loading...">
            <ItemListSelectedItemContent itemHeaderRef={itemHeaderRef} />
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
    </ItemListRoot>
  );
}

export default AppLayout;
