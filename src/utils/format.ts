/**
 * Pure formatting helpers used by the dashboard cards, chart axes, and
 * forecast rows.
 *
 * All numeric formatters round to one decimal place per the design's display
 * rules (Requirement 7.1, 8.4) and append the appropriate unit suffix. Date
 * and time formatters delegate to `date-fns` so locale-aware output is easy
 * to swap in later if the app supports more languages.
 */

import { format, parseISO } from "date-fns";

import type { WeatherCondition } from "@/types/weather";

/** Round a finite number to one decimal place; falls through `NaN` unchanged. */
function toOneDecimal(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return value.toFixed(1);
}

/** Round a finite number to the nearest integer; falls through `NaN` unchanged. */
function toInteger(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return Math.round(value).toString();
}

// -----------------------------------------------------------------------------
// Numeric formatters
// -----------------------------------------------------------------------------

export function formatTemperature(celsius: number): string {
  return `${toOneDecimal(celsius)}°C`;
}

export function formatWindSpeed(kmh: number): string {
  return `${toOneDecimal(kmh)} km/jam`;
}

export function formatHumidity(pct: number): string {
  return `${toInteger(pct)}%`;
}

export function formatUv(index: number): string {
  return toOneDecimal(index);
}

export function formatRainProbability(pct: number): string {
  return `${toInteger(pct)}%`;
}

export function formatPrecipitation(mm: number): string {
  return `${toOneDecimal(mm)} mm`;
}

// -----------------------------------------------------------------------------
// Date / time formatters
// -----------------------------------------------------------------------------

/** `HH:mm` local-time formatter for chart axes and "last updated" labels. */
export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

/** Localized day-of-week + date label for daily forecast cards (e.g. `Sen, 02 Jun`). */
export function formatDate(iso: string): string {
  return format(parseISO(iso), "EEE, dd MMM");
}

// -----------------------------------------------------------------------------
// Weather condition labels (Indonesian)
// -----------------------------------------------------------------------------

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: "Cerah",
  partly_cloudy: "Berawan Sebagian",
  cloudy: "Berawan",
  fog: "Berkabut",
  drizzle: "Gerimis",
  rain: "Hujan",
  heavy_rain: "Hujan Lebat",
  thunderstorm: "Badai Petir",
  snow: "Salju",
  unknown: "Tidak Diketahui",
};

export function weatherConditionLabel(condition: WeatherCondition): string {
  return CONDITION_LABELS[condition];
}
