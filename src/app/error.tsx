/**
 * Route-level error boundary for unexpected render errors.
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-6xl">💥</div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        Terjadi Kesalahan
      </h2>
      <p className="mb-6 text-muted-foreground">
        Halaman ini tidak dapat dimuat. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
      >
        Coba Lagi
      </button>
    </div>
  );
}
