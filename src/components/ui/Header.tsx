/**
 * `Header` — logo, search slot, and theme toggle in a glassmorphism bar.
 */

import { CloudRain } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export interface HeaderProps {
  readonly children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <CloudRain className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            Weather Alert Indonesia
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-center max-w-md">
          {children}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
