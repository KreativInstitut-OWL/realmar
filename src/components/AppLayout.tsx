import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppBreadcrumbContainer, AppBreadcrumbProvider } from "./AppBreadcrumb";
import { AppSidebar } from "./AppSidebar";
import { EditorViewComboboxEditorCurrentView } from "./EditorViewCombobox";
import { MainView } from "./MainView";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "./ui/breadcrumb";

function AppLayout() {
  // const editorCurrentView = useStore((state) => state.editorCurrentView);

  return (
    <AppBreadcrumbProvider>
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
                <AppBreadcrumbContainer />
                {/* <BreadcrumbSeparator />
                {editorCurrentView === "items" ? (
                  <>

                  </>
                ) : null} */}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <MainView />
        </SidebarInset>
      </SidebarProvider>
    </AppBreadcrumbProvider>
  );
}

export default AppLayout;
