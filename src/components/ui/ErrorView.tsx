/**
 * `ErrorView` — renders typed message per `AppError.kind` with optional retry.
 */

"use client";

import type { AppError } from "@/types/error";

export interface ErrorViewProps {
  readonly error: AppError;
  readonly onRetry?: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  const message = getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {message.title}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {message.description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

function getErrorMessage(error: AppError): {
  title: string;
  description: string;
} {
  switch (error.kind) {
    case "city_not_found":
      return {
        title: "Kota Tidak Ditemukan",
        description: `Tidak ada hasil untuk "${error.query}".`,
      };
    case "network_offline":
      return {
        title: "Tidak Ada Koneksi",
        description: "Periksa koneksi internet Anda dan coba lagi.",
      };
    case "rate_limited":
      return {
        title: "Terlalu Banyak Permintaan",
        description: `Mohon tunggu ${Math.ceil(error.retryAfterMs / 1000)} detik.`,
      };
    case "validation_failed":
      return {
        title: "Data Tidak Valid",
        description: "Respons server tidak sesuai format yang diharapkan.",
      };
    case "upstream_failure":
      return {
        title: "Layanan Tidak Tersedia",
        description: `${error.source === "open-meteo" ? "Open-Meteo" : "Nominatim"} mengembalikan kesalahan (${error.status}).`,
      };
    case "unknown":
    default:
      return {
        title: "Terjadi Kesalahan",
        description:
          error.kind === "unknown" ? error.message : "Silakan coba lagi nanti.",
      };
  }
}
