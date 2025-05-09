import {
  Dialog,
  DialogCloseX,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SplashScreen } from "./SplashScreen";

export default function SplashScreenDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogCloseX />
        </DialogHeader>
        <SplashScreen className="text-gray-12 py-8" />
      </DialogContent>
    </Dialog>
  );
}
