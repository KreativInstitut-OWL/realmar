import {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
  useContext,
} from "react";
import { createPortal } from "react-dom";

const AppBreadcrumbContext = createContext<
  | {
      container: HTMLElement | null;
      setContainer: Dispatch<SetStateAction<HTMLElement | null>>;
    }
  | undefined
>(undefined);

export function AppBreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <AppBreadcrumbContext.Provider value={{ container, setContainer }}>
      {children}
    </AppBreadcrumbContext.Provider>
  );
}

export function AppBreadcrumbPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(AppBreadcrumbContext);
  if (!context?.container) return null;
  return createPortal(children, context.container);
}

export function AppBreadcrumbContainer() {
  const context = useContext(AppBreadcrumbContext);
  if (!context) {
    throw new Error(
      "AppBreadcrumbContainer must be used within AppBreadcrumbProvider"
    );
  }
  return (
    <div
      className="contents"
      ref={(element) => context.setContainer(element)}
    />
  );
}
