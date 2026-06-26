/**
 * `Providers` — App-wide providers (Toaster, ErrorBoundary, hydration)
 */

"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";

import { ErrorBoundary } from "./ui/ErrorBoundary";
import { useWeatherStore } from "@/store/weather-store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydrate favorites from localStorage on mount
  useEffect(() => {
    useWeatherStore.getState().hydrate();
  }, []);

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(30 41 59)",
            border: "1px solid rgb(51 65 85)",
            color: "rgb(248 250 252)",
          },
        }}
      />
      {children}
    </ErrorBoundary>
  );
}
