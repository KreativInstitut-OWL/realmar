import { Heart } from "lucide-react";
import * as React from "react";
import { RealmArLogo } from "./RealmArLogo";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

const VERSION = "1.0";
const VERSION_TAG = "Beta";

export const SplashScreen = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-full w-full grid place-items-center text-center text-gray-11",
        className
      )}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col gap-6 items-center">
          <div className="relative max-w-64">
            <RealmArLogo className="w-full" />
            <Badge
              size="sm"
              className="absolute -right-2.5 translate-x-full top-0"
            >
              {VERSION} {VERSION_TAG}
            </Badge>
          </div>
          <p className="text-lg">
            Create Augmented and Extended Reality experiences with{" "}
            <RealmArLogo inline />.
          </p>
        </div>
        {children}
        <div
          className={cn("flex flex-col gap-4", {
            "mt-16": !!children,
          })}
        >
          <p className="text-sm">
            All data stays local in your browser and can be saved at any time:
            nothing is stored on our servers.
            <br />
            Export your AR project as an A-Frame-powered web app to continue
            editing and host it anywhere.
          </p>
          <p className="text-sm">
            Made with{" "}
            <Heart className="size-3.5 inline -translate-y-0.5 fill-ruby-9 text-ruby-9" />
            <span className="sr-only">love</span> in Germany by{" "}
            <a
              href="https://kreativ.institute"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-gray-12"
            >
              KreativInstitut.OWL
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
