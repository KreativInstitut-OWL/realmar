import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppBreadcrumbContainer, AppBreadcrumbProvider } from "./AppBreadcrumb";
import { AppSidebar } from "./AppSidebar";
import { EditorViewComboboxEditorCurrentView } from "./EditorViewCombobox";
import { MainView } from "./MainView";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "./ui/breadcrumb";
import { contentVariants } from "./ui/styles/menu";
import { cn } from "@/lib/utils";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function AppLayout() {
  return (
    <AppBreadcrumbProvider>
      <SidebarProvider
        style={{ "--sidebar-width": "320px" } as React.CSSProperties}
        className="[--header-height:40px]"
        defaultOpen={false}
      >
        <Header />
        <AppSidebar />
        <SidebarInset>
          <MainView />
        </SidebarInset>
      </SidebarProvider>
    </AppBreadcrumbProvider>
  );
}

function Header() {
  const { state } = useSidebar();
  return (
    <CollapsiblePrimitive.Root asChild open={state === "collapsed"}>
      <header
        className={cn(
          contentVariants(),
          // "opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity",
          "shadow-none min-w-0 fixed top-1 -left-px flex shrink-0 items-center gap-2 w-fit rounded-r-full px-3 h-(--header-height) z-10 transition-all",
          {
            "translate-x-(--sidebar-width-icon)": state === "collapsed",
            "translate-x-(--sidebar-width)": state === "expanded",
          }
        )}
      >
        <SidebarTrigger className="-ml-1.5" />

        <CollapsiblePrimitive.Content className="contents">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <EditorViewComboboxEditorCurrentView />
              </BreadcrumbItem>
              <AppBreadcrumbContainer />
            </BreadcrumbList>
          </Breadcrumb>
        </CollapsiblePrimitive.Content>
      </header>
    </CollapsiblePrimitive.Root>
  );
}

export default AppLayout;
