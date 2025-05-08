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
          <p className="text-sm text-gray-11 text-center">
            Create Augmented and Extended Reality experiences with{" "}
            <span className="font-semibold">realm AR</span>.
          </p>
          <p className="text-sm text-gray-11 text-center">
            All data stays local in your browser and can be saved at any time:
            nothing is stored on our servers.
            <br />
            Export your AR project as an A-Frame-powered web app to continue
            editing and host it anywhere.
          </p>
          <p className="text-sm text-gray-11 text-center">
            Made with{" "}
            <Heart className="size-3.5 inline -translate-y-0.5 fill-ruby-9 text-ruby-9" />
            <span className="sr-only">love</span> in Germany by{" "}
            <a
              href="https://kreativ.institute"
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
