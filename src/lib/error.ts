/**
 * Error normalization and constructor helpers.
 *
 * `normalizeError` maps any thrown value (AxiosError, ZodError, unknown) into
 * the typed `AppError` union at the service boundary. Downstream consumers can
 * switch on `kind` without worrying about HTTP status codes, Zod path arrays,
 * or raw error messages.
 *
 * Constructor helpers (`appError.*`) provide type-safe, idiomatic ways to
 * build each variant without manually spelling out the discriminant.
 */

import type { AxiosError } from "axios";
import type { ZodError } from "zod";

import type { AppError, AppErrorSource } from "@/types/error";

// -----------------------------------------------------------------------------
// Constructor helpers
// -----------------------------------------------------------------------------

export const appError = {
  networkOffline(): AppError {
    return { kind: "network_offline" };
  },

  rateLimited(retryAfterMs: number): AppError {
    return { kind: "rate_limited", retryAfterMs };
  },

  validationFailed(zodError: ZodError): AppError {
    const issues = zodError.issues.map((issue) => ({
      path: issue.path.join(".") || "(root)",
      message: issue.message,
    }));
    return { kind: "validation_failed", issues };
  },

  upstreamFailure(status: number, source: AppErrorSource): AppError {
    return { kind: "upstream_failure", status, source };
  },

  cityNotFound(query: string): AppError {
    return { kind: "city_not_found", query };
  },

  unknown(message: string): AppError {
    return { kind: "unknown", message };
  },
};

// -----------------------------------------------------------------------------
// normalizeError — the main entry point for service-level catch blocks
// -----------------------------------------------------------------------------

/**
 * Normalize any thrown value into a typed `AppError` at the service boundary.
 *
 * @param unknownError - The value caught in a `catch` block.
 * @param source - Which upstream API (if any) was being called when the error occurred.
 * @returns A well-typed `AppError` variant suitable for storage in the Zustand store.
 */
export function normalizeError(
  unknownError: unknown,
  source?: AppErrorSource,
): AppError {
  // Axios HTTP errors
  if (isAxiosError(unknownError)) {
    const status = unknownError.response?.status;

    // Network timeout or offline
    if (
      unknownError.code === "ECONNABORTED" ||
      unknownError.code === "ERR_NETWORK" ||
      !status
    ) {
      return appError.networkOffline();
    }

    // HTTP 429: rate-limited
    if (status === 429) {
      const retryAfter = unknownError.response?.headers["retry-after"];
      const retryAfterMs =
        typeof retryAfter === "string" && /^\d+$/.test(retryAfter)
          ? parseInt(retryAfter, 10) * 1000
          : 1000;
      return appError.rateLimited(retryAfterMs);
    }

    // Other non-2xx responses
    if (status && source) {
      return appError.upstreamFailure(status, source);
    }
  }

  // Zod validation errors
  if (isZodError(unknownError)) {
    return appError.validationFailed(unknownError);
  }

  // Everything else: stringify the error message if available
  if (unknownError instanceof Error) {
    return appError.unknown(unknownError.message);
  }

  return appError.unknown(String(unknownError));
}

// -----------------------------------------------------------------------------
// Type guards
// -----------------------------------------------------------------------------

function isAxiosError(value: unknown): value is AxiosError {
  return (
    typeof value === "object" &&
    value !== null &&
    "isAxiosError" in value &&
    value.isAxiosError === true
  );
}

function isZodError(value: unknown): value is ZodError {
  return (
    typeof value === "object" &&
    value !== null &&
    "issues" in value &&
    Array.isArray((value as { issues: unknown }).issues)
  );
}
