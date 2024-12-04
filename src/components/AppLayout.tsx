import { ArrowRightFromLine } from "lucide-react";
import { Button } from "./ui/button";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ItemListRoot, ItemListSelectedItemContent } from "./ItemList";
import { ItemNavigatorSidebar } from "./ItemNavigatorSidebar";

function AppLayout() {
  return (
    <ItemListRoot>
      <SidebarProvider
        style={{ "--sidebar-width": "350px" } as React.CSSProperties}
      >
        <ItemNavigatorSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-white p-4 z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <Button type="submit" className="ml-auto" size="sm">
              Export
              <ArrowRightFromLine />
            </Button>
          </header>

          <ItemListSelectedItemContent />
        </SidebarInset>
      </SidebarProvider>
    </ItemListRoot>
  );
}

export default AppLayout;
