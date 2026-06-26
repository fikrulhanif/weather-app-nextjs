/**
 * `Header` — Clean header dengan search yang tidak tertutup elemen lain
 */

"use client";

import { Cloud } from "lucide-react";

export interface HeaderProps {
  readonly children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0F19] border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-white">
                Weather Alert
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">Indonesia</p>
            </div>
          </div>

          {/* Search - Full width on mobile, constrained on desktop - RELATIVE POSITION */}
          <div className="flex-1 max-w-md relative z-50">{children}</div>
        </div>
      </div>
    </header>
  );
}
