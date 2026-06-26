/**
 * `ErrorBoundary` — class component catching render errors.
 */

"use client";

import React from "react";

export interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-4xl">💥</div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Terjadi Kesalahan
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Komponen ini tidak dapat dimuat. Silakan muat ulang halaman.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
