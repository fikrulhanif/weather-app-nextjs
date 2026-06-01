/**
 * Tagged error union used across the application.
 *
 * Every service-level failure is normalized into an `AppError` value at the
 * service boundary. Downstream consumers can switch on `kind` and access only
 * the fields relevant to that variant — no string parsing, no `instanceof`.
 */

export type AppErrorSource = "open-meteo" | "nominatim";

export type AppError =
  | { readonly kind: "city_not_found"; readonly query: string }
  | { readonly kind: "network_offline" }
  | { readonly kind: "rate_limited"; readonly retryAfterMs: number }
  | {
      readonly kind: "validation_failed";
      readonly issues: readonly AppErrorIssue[];
    }
  | {
      readonly kind: "upstream_failure";
      readonly status: number;
      readonly source: AppErrorSource;
    }
  | { readonly kind: "unknown"; readonly message: string };

/**
 * A single validation violation with the offending field path and a
 * human-readable message describing what went wrong.
 */
export interface AppErrorIssue {
  /** Dot-delimited or array-indexed path, e.g. `current.temperature_2m` or `[0].lat`. */
  readonly path: string;
  readonly message: string;
}

export type AppErrorKind = AppError["kind"];

/** Type guard narrowing an unknown value to `AppError`. */
export function isAppError(value: unknown): value is AppError {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const kind = (value as { kind?: unknown }).kind;
  return (
    kind === "city_not_found" ||
    kind === "network_offline" ||
    kind === "rate_limited" ||
    kind === "validation_failed" ||
    kind === "upstream_failure" ||
    kind === "unknown"
  );
}
