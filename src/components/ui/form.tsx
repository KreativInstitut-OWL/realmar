import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 gap-2", className)}
      {...props}
    />
  );
});
FormGroup.displayName = "FormGroup";

const FormRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: number;
    end?: React.ReactNode;
  }
>(({ className, columns = 1, children, end, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-[repeat(var(--form-row-columns),minmax(0,1fr))] gap-2 pe-9 relative",
        className
      )}
      style={{ "--form-row-columns": columns } as React.CSSProperties}
      {...props}
    >
      {children}
      {end ? (
        <div data-form-row-end="" className="absolute end-0 w-7 h-full">
          {end}
        </div>
      ) : null}
    </div>
  );
});
FormRow.displayName = "FormRow";

const FormTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    end?: React.ReactNode;
  }
>(({ className, children, end, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-4 h-7 items-center text-xs pe-9 relative",
        className
      )}
      {...props}
    >
      {children}
      {end ? (
        <div data-form-title-end="" className="absolute end-0 w-7 h-full">
          {end}
        </div>
      ) : null}
    </div>
  );
});
FormTitle.displayName = "FormTitle";

const useFormItem = () => {
  const { id, ...rest } = React.useContext(FormItemContext);

  return {
    id,
    ...rest,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
};

type FormItemContextValue = {
  id: string;
  error: string | undefined;
  disabled: boolean | undefined;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    error?: string;
    disabled?: boolean;
    asChild?: boolean;
  }
>(({ className, error, disabled, asChild, ...props }, ref) => {
  const id = React.useId();

  const Component = asChild ? Slot : "div";

  return (
    <FormItemContext.Provider value={{ id, error, disabled }}>
      <Component ref={ref} className={className} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormItem();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-red-500 dark:text-red-900", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormItem();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormItem();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormItem();
  const body = error ?? children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-sm font-medium text-red-500 dark:text-red-900",
        className
      )}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  FormGroup,
  FormRow,
  FormTitle,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useFormItem,
};
