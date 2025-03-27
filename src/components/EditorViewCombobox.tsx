import { editorView, EditorView } from "@/const/editorView";
import { useStore } from "@/store";
import * as React from "react";
import { Combobox, ComboboxTriggerButton } from "./ui/combobox";

export function EditorViewComboboxEditorCurrentView() {
  const editorCurrentView = useStore((state) => state.editorCurrentView);
  const setEditorCurrentView = useStore((state) => state.setEditorCurrentView);

  return (
    <EditorViewCombobox
      value={editorCurrentView ?? undefined}
      onSelect={(editorView, close) => {
        setEditorCurrentView(editorView as EditorView);
        close();
      }}
    />
  );
}

export function EditorViewCombobox({
  triggerButtonProps,
  ...props
}: Omit<
  React.ComponentProps<
    typeof Combobox<{ label: React.ReactNode; value: string }[]>
  >,
  "options"
> & {
  triggerButtonProps?: React.ComponentProps<typeof ComboboxTriggerButton>;
}) {
  return (
    <Combobox
      options={Object.entries(editorView).map(([value, label]) => ({
        label,
        value,
      }))}
      empty="No view found."
      inputPlaceholder="Search..."
      {...props}
    >
      <ComboboxTriggerButton
        aria-label="Choose View"
        noValue="Choose View..."
        {...triggerButtonProps}
      />
    </Combobox>
  );
}
