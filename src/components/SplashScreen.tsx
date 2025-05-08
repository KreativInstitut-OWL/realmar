import { Heart } from "lucide-react";
import * as React from "react";
import { RealmArLogo } from "./RealmArLogo";
import { cn } from "@/lib/utils";

export const SplashScreen = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("h-full w-full grid place-items-center", className)}>
      <div className="flex flex-col items-center gap-10">
        <RealmArLogo className="max-w-64 text-gray-11" />
        {children}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-11 text-center font-medium">
            Create Augmented and Extended Reality experiences using realm AR.
          </p>
          <p className="text-sm text-gray-11 text-center">
            All your data is stored locally in your browser and can be saved to
            your computer at any time. Nothing is stored on our servers.
            <br />
            Export your AR application as a A-Frame powered web application you
            can continue editing and host anywhere.
          </p>
          <p className="text-sm text-gray-11 text-center">
            Made with <Heart className="size-3 inline -translate-y-px" />
            <span className="sr-only">love</span> in Germany at{" "}
            <a
              href="https://kreative.institue"
              target="_blank"
              rel="noreferrer"
              className="text-gray-11 underline hover:text-gray-12"
            >
              KreativInstitut.OWL
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
