/**
 * Alert Engine — the pure, deterministic core of the Weather Alert Indonesia
 * application.
 *
 * Two public functions:
 * 1. `evaluateAlerts(snapshot)` — applies all rules to a single snapshot and
 *    returns 0..3 alerts sorted by severity descending then by kind precedence.
 * 2. `evaluateUpcomingAlerts(hourly)` — scans up to 24 hourly points, deduplicates
 *    by kind, and retains only the earliest triggering point per kind.
 *
 * Both functions are pure: no I/O, no mutation, no wall-clock reads. All
 * temporal context comes from the input fields (`observedAt`, `timestamp`).
 * This design allows the engine to be property-tested exhaustively without
 * mocking time or HTTP calls.
 */

import type { Alert, AlertKind, AlertSnapshot } from "@/types/alert";
import type { HourlyPoint } from "@/types/weather";

import { ALERT_RULES } from "./alert-rules";

// -----------------------------------------------------------------------------
// Severity ranking for sort order (high > medium > low)
// -----------------------------------------------------------------------------

const SEVERITY_RANK = { high: 3, medium: 2, low: 1 } as const;

// -----------------------------------------------------------------------------
// Kind precedence for tie-breaking (heavy_rain > strong_wind > high_uv)
// -----------------------------------------------------------------------------

const KIND_PRECEDENCE: Record<AlertKind, number> = {
  heavy_rain: 3,
  strong_wind: 2,
  high_uv: 1,
};

// -----------------------------------------------------------------------------
// Runtime validation guard
// -----------------------------------------------------------------------------

function validateSnapshot(snapshot: AlertSnapshot): void {
  if (
    typeof snapshot !== "object" ||
    snapshot === null ||
    typeof snapshot.rainProbabilityPct !== "number" ||
    typeof snapshot.windSpeedKmh !== "number" ||
    typeof snapshot.uvIndex !== "number" ||
    typeof snapshot.observedAt !== "string"
  ) {
    throw new Error(
      "Invalid AlertSnapshot: missing or non-numeric required fields.",
    );
  }

  if (
    !Number.isFinite(snapshot.rainProbabilityPct) ||
    !Number.isFinite(snapshot.windSpeedKmh) ||
    !Number.isFinite(snapshot.uvIndex)
  ) {
    throw new Error("Invalid AlertSnapshot: non-finite numeric field.");
  }

  if (
    snapshot.rainProbabilityPct < 0 ||
    snapshot.rainProbabilityPct > 100 ||
    snapshot.windSpeedKmh < 0 ||
    snapshot.uvIndex < 0
  ) {
    throw new Error("Invalid AlertSnapshot: numeric field out of valid range.");
  }
}

// -----------------------------------------------------------------------------
// evaluateAlerts — main entry point
// -----------------------------------------------------------------------------

/**
 * Evaluate a single weather snapshot and return 0..3 alerts sorted by severity
 * descending, then by fixed kind precedence.
 *
 * @throws {Error} if the snapshot fails precondition validation (Req 4.11, 4.12).
 */
export function evaluateAlerts(snapshot: AlertSnapshot): readonly Alert[] {
  validateSnapshot(snapshot);

  const alerts: Alert[] = [];

  for (const rule of ALERT_RULES) {
    const alert = rule.evaluate(snapshot);
    if (alert !== null) {
      alerts.push(alert);
    }
  }

  // Sort by severity descending, then by kind precedence descending.
  alerts.sort((a, b) => {
    const severityDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return KIND_PRECEDENCE[b.kind] - KIND_PRECEDENCE[a.kind];
  });

  return Object.freeze(alerts);
}

// -----------------------------------------------------------------------------
// evaluateUpcomingAlerts — forecast-window scanner
// -----------------------------------------------------------------------------

/**
 * Scan up to 24 hourly forecast points and return at most one alert per kind,
 * retaining only the earliest triggering point for each kind.
 *
 * @throws {Error} if the hourly array length exceeds 24 (Req 5.6).
 */
export function evaluateUpcomingAlerts(
  hourly: readonly HourlyPoint[],
): readonly Alert[] {
  if (hourly.length > 24) {
    throw new Error(
      `Invalid hourly array length: ${hourly.length} exceeds maximum of 24.`,
    );
  }

  if (hourly.length === 0) {
    return Object.freeze([]);
  }

  const collected: Alert[] = [];
  const seen = new Set<AlertKind>();

  for (const point of hourly) {
    const snapshot: AlertSnapshot = {
      rainProbabilityPct: point.rainProbabilityPct,
      windSpeedKmh: point.windSpeedKmh,
      uvIndex: point.uvIndex,
      observedAt: point.timestamp,
    };

    const pointAlerts = evaluateAlerts(snapshot);

    for (const alert of pointAlerts) {
      if (!seen.has(alert.kind)) {
        collected.push(alert);
        seen.add(alert.kind);
      }
    }
  }

  return Object.freeze(collected);
}
