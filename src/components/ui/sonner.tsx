import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-1 group-[.toaster]:text-gray-11 group-[.toaster]:border-gray-4 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-gray-11 dark:group-[.toaster]:text-gray-2 dark:group-[.toaster]:border-gray-10",
          description:
            "group-[.toast]:text-gray-11 dark:group-[.toast]:text-gray-11",
          actionButton:
            "group-[.toast]:bg-gray-11 group-[.toast]:text-gray-2 dark:group-[.toast]:bg-gray-2 dark:group-[.toast]:text-gray-11",
          cancelButton:
            "group-[.toast]:bg-gray-3 group-[.toast]:text-gray-11 dark:group-[.toast]:bg-gray-10 dark:group-[.toast]:text-gray-11",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
