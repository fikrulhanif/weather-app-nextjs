/**
 * Alert domain types for the Weather Alert Indonesia application.
 *
 * Alerts are produced by the pure Alert Engine over a minimal `AlertSnapshot`.
 * The shapes here are deliberately narrow so that the engine remains free of
 * I/O concerns and can be exercised by property-based tests.
 */

export type AlertSeverity = "low" | "medium" | "high";

export type AlertKind = "heavy_rain" | "strong_wind" | "high_uv";

export interface Alert {
  /** Composite id derived from `${kind}:${observedAt}`. */
  readonly id: string;
  readonly kind: AlertKind;
  readonly severity: AlertSeverity;
  /** Indonesian-language headline, e.g. "⚠️ Potensi Hujan Tinggi". */
  readonly title: string;
  /** Indonesian-language detail with the observed value. */
  readonly description: string;
  readonly observedValue: number;
  readonly threshold: number;
  /** ISO 8601 timestamp of the snapshot that triggered the alert. */
  readonly observedAt: string;
}

/**
 * Minimal data shape consumed by alert rules. Pure inputs only — no
 * coordinates, city metadata, or chart series. The engine never reads
 * the wall clock; all temporal context comes from `observedAt`.
 */
export interface AlertSnapshot {
  readonly rainProbabilityPct: number;
  readonly windSpeedKmh: number;
  readonly uvIndex: number;
  readonly observedAt: string;
}

export interface AlertRule {
  readonly kind: AlertKind;
  /** Returns the rule's threshold so callers can render comparison hints. */
  readonly threshold: number;
  /** Indonesian-language title rendered when the rule fires. */
  readonly title: string;
  /** Pure evaluator: returns an `Alert` if the snapshot triggers the rule, else `null`. */
  readonly evaluate: (snapshot: AlertSnapshot) => Alert | null;
}
