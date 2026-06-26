/**
 * `Providers` — wraps children with ThemeProvider, Toaster, and ErrorBoundary.
 */

"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { ErrorBoundary } from "./ui/ErrorBoundary";
import { useWeatherStore } from "@/store/weather-store";

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydrate favorites from localStorage on mount
  useEffect(() => {
    useWeatherStore.getState().hydrate();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary>
        {children}
        <Toaster position="top-right" richColors />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
