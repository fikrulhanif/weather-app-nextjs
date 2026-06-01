/**
 * WMO weather-code → `WeatherCondition` mapping.
 *
 * Total function: every non-negative integer returns a `WeatherCondition`,
 * with unmapped or non-finite values collapsing to `"unknown"`. Pure and
 * deterministic so the result can be memoized or precomputed safely.
 *
 * Mapping comes directly from the design document (Requirement 8.7).
 */

import type { WeatherCondition } from "@/types/weather";

const CODE_TO_CONDITION: ReadonlyMap<number, WeatherCondition> = new Map([
  [0, "clear"],
  [1, "partly_cloudy"],
  [2, "partly_cloudy"],
  [3, "cloudy"],
  [45, "fog"],
  [48, "fog"],
  [51, "drizzle"],
  [53, "drizzle"],
  [55, "drizzle"],
  [56, "drizzle"],
  [57, "drizzle"],
  [61, "rain"],
  [63, "rain"],
  [66, "rain"],
  [80, "rain"],
  [81, "rain"],
  [65, "heavy_rain"],
  [67, "heavy_rain"],
  [82, "heavy_rain"],
  [95, "thunderstorm"],
  [96, "thunderstorm"],
  [99, "thunderstorm"],
  [71, "snow"],
  [73, "snow"],
  [75, "snow"],
  [77, "snow"],
  [85, "snow"],
  [86, "snow"],
]);

export function weatherCodeToCondition(code: number): WeatherCondition {
  if (!Number.isFinite(code) || code < 0) return "unknown";
  return CODE_TO_CONDITION.get(code) ?? "unknown";
}
