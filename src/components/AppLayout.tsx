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
import { Suspense, useRef } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useCurrentItem } from "@/store";

function AppLayout() {
  const item = useCurrentItem();
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
                <BreadcrumbItem>Marker {item.index + 1}</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem ref={itemHeaderRef} />
              </BreadcrumbList>
            </Breadcrumb>

            <Button type="submit" className="ml-auto" size="sm">
              Export
              <ArrowRightFromLine />
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
