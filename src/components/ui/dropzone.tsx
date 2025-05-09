// Packages:
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";
import * as React from "react";
import {
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
  type DropzoneProps as _DropzoneProps,
  type DropzoneState,
} from "react-dropzone";

interface DropzoneContextValue {
  dropzoneState: DropzoneState;
  dropzoneProps: _DropzoneProps;
}

const DropzoneContext = React.createContext<DropzoneContextValue | undefined>(
  undefined
);

const useDropzoneContext = () => {
  const context = React.useContext(DropzoneContext);
  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone");
  }
  return context;
};

export interface DropzoneProviderProps
  extends Omit<_DropzoneProps, "children"> {
  children?: React.ReactNode;
}

const DropzoneProvider = ({
  children,
  ...dropzoneProps
}: DropzoneProviderProps) => {
  const dropzoneState = useDropzone(dropzoneProps);

  const contextValue = React.useMemo(
    () => ({
      dropzoneProps,
      dropzoneState,
    }),
    [dropzoneProps, dropzoneState]
  );

  return (
    <DropzoneContext.Provider value={contextValue}>
      {children}
    </DropzoneContext.Provider>
  );
};

const Dropzone = ({
  className,
  inputProps,
  ...props
}: DropzoneRootProps & { inputProps?: DropzoneInputProps }) => {
  const { dropzoneState } = useDropzoneContext();
  return (
    <div
      {...dropzoneState.getRootProps({
        className: cn(
          "flex justify-center items-center w-full min-h-32 border-2 border-dashed border-azure-6 rounded-lg bg-clip-padding bg-gray-3 hover:bg-gray-4 hover:border-azure-7 transition-all select-none cursor-pointer outline-none focus-visible:ring-2",
          { "border-lime-7 bg-gray-2": dropzoneState.isDragAccept },
          className
        ),
      })}
    >
      <input {...dropzoneState.getInputProps(inputProps)} />
      {props.children}
    </div>
  );
};

const DropzoneDragAcceptContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { dropzoneState } = useDropzoneContext();

  if (!dropzoneState.isDragAccept) return null;

  return <div className={cn("text-sm font-medium", className)} {...props} />;
};

const DropzoneContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { dropzoneState, dropzoneProps } = useDropzoneContext();

  if (dropzoneState.isDragAccept) return null;

  if (children)
    return (
      <div
        className={cn("flex items-center flex-col gap-1.5", className)}
        {...props}
      >
        {children}
      </div>
    );

  return (
    <div
      className={cn("flex items-center flex-col gap-1.5", className)}
      {...props}
    >
      <div className="flex items-center flex-row gap-0.5 text-sm font-medium">
        <UploadIcon className="mr-2 h-4 w-4" /> Upload files
      </div>
      {dropzoneProps.maxSize && (
        <div className="text-sm text-gray-11 font-medium">
          Max. file size: {(dropzoneProps.maxSize / (1024 * 1024)).toFixed(2)}{" "}
          MB
        </div>
      )}
    </div>
  );
};

export {
  Dropzone,
  DropzoneContent,
  DropzoneDragAcceptContent,
  DropzoneProvider,
};
