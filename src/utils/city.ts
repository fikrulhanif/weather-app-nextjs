/**
 * City- and query-related pure helpers.
 *
 * Two responsibilities live here:
 *
 * 1. **Stable city identity** via `round3` and `cityIdFromCoords`. Both are
 *    pure and deterministic, so the same coordinates always produce the same
 *    id regardless of which service constructed the value.
 * 2. **Query normalization** via `normalizeQuery`. Used by `City_Search` to
 *    coalesce user input before debouncing, throttling, or cache lookup.
 */

import { COORDINATE_PRECISION_DECIMALS } from "@/constants/thresholds";
import type { City, Coordinates } from "@/types/weather";

/**
 * Round a finite number to `decimals` decimal places using
 * half-away-from-zero rounding so positive and negative magnitudes are
 * treated symmetrically.
 *
 * Example: `round3(-6.1755) === -6.176` and `round3(6.1755) === 6.176`.
 */
export function round3(
  value: number,
  decimals = COORDINATE_PRECISION_DECIMALS,
): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  const sign = Math.sign(value) || 1;
  return (sign * Math.round(Math.abs(value) * factor)) / factor;
}

/**
 * Build a stable city id of the form `${round3(latitude)}:${round3(longitude)}`.
 * Two coordinate inputs that round to the same 3-decimal values produce the
 * same id (Requirement 3.1, 1.1).
 */
export function cityIdFromCoords(coords: Coordinates): string {
  return `${round3(coords.latitude)}:${round3(coords.longitude)}`;
}

/** Metadata payload accepted by `createCityFromCoords`. */
export interface CityMetadata {
  readonly name: string;
  readonly displayName: string;
  readonly country: string;
  readonly admin1?: string;
}

/** Compose a `City` value from coordinates and human-readable metadata. */
export function createCityFromCoords(
  coords: Coordinates,
  metadata: CityMetadata,
): City {
  const rounded: Coordinates = {
    latitude: round3(coords.latitude),
    longitude: round3(coords.longitude),
  };
  return {
    id: cityIdFromCoords(rounded),
    name: metadata.name,
    displayName: metadata.displayName,
    country: metadata.country,
    admin1: metadata.admin1,
    coordinates: rounded,
  };
}

/**
 * Normalize a raw search query for use as a cache key and request term.
 *
 * The pipeline mirrors the requirements (Req 2.5, 6.5):
 *
 * 1. Apply Unicode NFC normalization so visually identical strings collapse.
 * 2. Trim leading and trailing whitespace.
 * 3. Lowercase the result.
 * 4. Collapse internal whitespace runs to a single space.
 */
export function normalizeQuery(raw: string): string {
  return raw.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}
