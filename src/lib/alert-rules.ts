/**
 * Alert severity classifiers and rule registry.
 *
 * Each classifier is a pure, monotonic non-decreasing function mapping an
 * observed numeric value to one of three severity levels. The rule registry
 * defines the fixed ordering (heavy_rain, strong_wind, high_uv) used for
 * tie-breaking when multiple alerts share the same severity.
 */

import {
  RAIN_SEVERITY_HIGH_PCT,
  RAIN_SEVERITY_MEDIUM_PCT,
  RAIN_THRESHOLD_PCT,
  UV_SEVERITY_HIGH_INDEX,
  UV_SEVERITY_MEDIUM_INDEX,
  UV_THRESHOLD_INDEX,
  WIND_SEVERITY_HIGH_KMH,
  WIND_SEVERITY_MEDIUM_KMH,
  WIND_THRESHOLD_KMH,
} from "@/constants/thresholds";
import type {
  Alert,
  AlertRule,
  AlertSeverity,
  AlertSnapshot,
} from "@/types/alert";

// -----------------------------------------------------------------------------
// Severity classifiers (pure, monotonic non-decreasing functions)
// -----------------------------------------------------------------------------

export function classifyRain(probabilityPct: number): AlertSeverity {
  if (probabilityPct >= RAIN_SEVERITY_HIGH_PCT) return "high";
  if (probabilityPct >= RAIN_SEVERITY_MEDIUM_PCT) return "medium";
  return "low";
}

export function classifyWind(speedKmh: number): AlertSeverity {
  if (speedKmh >= WIND_SEVERITY_HIGH_KMH) return "high";
  if (speedKmh >= WIND_SEVERITY_MEDIUM_KMH) return "medium";
  return "low";
}

export function classifyUv(uvIndex: number): AlertSeverity {
  if (uvIndex >= UV_SEVERITY_HIGH_INDEX) return "high";
  if (uvIndex >= UV_SEVERITY_MEDIUM_INDEX) return "medium";
  return "low";
}

// -----------------------------------------------------------------------------
// Rule registry (ordered array defining kind precedence for tie-breaking)
// -----------------------------------------------------------------------------

const heavyRainRule: AlertRule = {
  kind: "heavy_rain",
  threshold: RAIN_THRESHOLD_PCT,
  title: "⚠️ Potensi Hujan Tinggi",
  evaluate(snapshot: AlertSnapshot): Alert | null {
    if (snapshot.rainProbabilityPct <= RAIN_THRESHOLD_PCT) return null;

    return {
      id: `heavy_rain:${snapshot.observedAt}`,
      kind: "heavy_rain",
      severity: classifyRain(snapshot.rainProbabilityPct),
      title: "⚠️ Potensi Hujan Tinggi",
      description: `Probabilitas hujan ${snapshot.rainProbabilityPct}%`,
      observedValue: snapshot.rainProbabilityPct,
      threshold: RAIN_THRESHOLD_PCT,
      observedAt: snapshot.observedAt,
    };
  },
};

const strongWindRule: AlertRule = {
  kind: "strong_wind",
  threshold: WIND_THRESHOLD_KMH,
  title: "⚠️ Angin Kencang",
  evaluate(snapshot: AlertSnapshot): Alert | null {
    if (snapshot.windSpeedKmh <= WIND_THRESHOLD_KMH) return null;

    return {
      id: `strong_wind:${snapshot.observedAt}`,
      kind: "strong_wind",
      severity: classifyWind(snapshot.windSpeedKmh),
      title: "⚠️ Angin Kencang",
      description: `Kecepatan angin ${snapshot.windSpeedKmh} km/jam`,
      observedValue: snapshot.windSpeedKmh,
      threshold: WIND_THRESHOLD_KMH,
      observedAt: snapshot.observedAt,
    };
  },
};

const highUvRule: AlertRule = {
  kind: "high_uv",
  threshold: UV_THRESHOLD_INDEX,
  title: "⚠️ UV Tinggi",
  evaluate(snapshot: AlertSnapshot): Alert | null {
    if (snapshot.uvIndex <= UV_THRESHOLD_INDEX) return null;

    return {
      id: `high_uv:${snapshot.observedAt}`,
      kind: "high_uv",
      severity: classifyUv(snapshot.uvIndex),
      title: "⚠️ UV Tinggi",
      description: `Indeks UV ${snapshot.uvIndex}`,
      observedValue: snapshot.uvIndex,
      threshold: UV_THRESHOLD_INDEX,
      observedAt: snapshot.observedAt,
    };
  },
};

/**
 * Ordered rule registry. The array order defines the fixed kind precedence
 * used for tie-breaking when multiple alerts share the same severity:
 * heavy_rain precedes strong_wind, strong_wind precedes high_uv.
 */
export const ALERT_RULES: readonly AlertRule[] = [
  heavyRainRule,
  strongWindRule,
  highUvRule,
] as const;
