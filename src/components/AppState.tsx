import { AppState, appStateSchema, getDefaultAppState } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useContext } from "react";
import {
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Form } from "./ui/form";

const ItemFieldArrayContext = createContext<UseFieldArrayReturn<
  AppState,
  "items",
  "_formId"
> | null>(null);

export function AppStateProvider({
  children,
  onExport,
}: {
  children: React.ReactNode;
  onExport: (appState: AppState) => void;
}) {
  const form = useForm<AppState>({
    resolver: zodResolver(appStateSchema),
    defaultValues: getDefaultAppState(),
  });

  const itemFieldArray = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "_formId",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onExport)} className="contents">
        <ItemFieldArrayContext.Provider value={itemFieldArray}>
          {children}
        </ItemFieldArrayContext.Provider>
      </form>
    </Form>
  );
}

export function useAppState() {
  const form = useFormContext<AppState>();
  return form;
}

export function useItemFieldArray() {
  const itemFieldArray = useContext(ItemFieldArrayContext);
  if (!itemFieldArray) {
    throw new Error(
      "useItemFieldArray must be used within an AppStateProvider"
    );
  }
  return itemFieldArray;
}
