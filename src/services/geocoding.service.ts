/**
 * Geocoding_Service — resolves city names to coordinates via Nominatim.
 *
 * Responsibilities:
 * - Enforce Nominatim rate-limit via module-scoped token-bucket throttle (Req 2.1).
 * - Include mandatory `User-Agent` header (already set in nominatimClient, Req 2.2).
 * - Validate raw responses with `NominatimResponseSchema` (Req 10.3, 10.4).
 * - Filter results by `address.country_code === "id"` (Req 6.3).
 * - Map filtered results to `City[]` capped at `limit` (default 5, range 1..10).
 * - Return empty array after filtering when no results (Req 12.1).
 * - Normalize all failures into typed `AppError` variants (Req 2.7, 12.2, 12.4).
 */

import type { City, Coordinates } from "@/types/weather";
import type { NominatimResponse } from "@/types/schemas";

import { NOMINATIM_REVERSE_PATH, NOMINATIM_SEARCH_PATH } from "@/constants/api";
import {
  GEOCODING_THROTTLE_CAPACITY,
  GEOCODING_THROTTLE_QUEUE_LIMIT,
  GEOCODING_THROTTLE_REFILL_INTERVAL_MS,
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT,
  SEARCH_MIN_LIMIT,
} from "@/constants/thresholds";
import { appError, normalizeError } from "@/lib/error";
import { isOnline, nominatimClient } from "@/lib/http";
import { createThrottle } from "@/lib/throttle";
import { NominatimResponseSchema } from "@/types/schemas";
import { createCityFromCoords } from "@/utils/city";

// -----------------------------------------------------------------------------
// Module-scoped throttle (1 token / 1000 ms, queue limit 50)
// -----------------------------------------------------------------------------

const geocodingThrottle = createThrottle({
  capacity: GEOCODING_THROTTLE_CAPACITY,
  refillIntervalMs: GEOCODING_THROTTLE_REFILL_INTERVAL_MS,
  queueLimit: GEOCODING_THROTTLE_QUEUE_LIMIT,
});

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export interface SearchCitiesOptions {
  readonly limit?: number;
  readonly signal?: AbortSignal;
}

export async function searchCities(
  query: string,
  options?: SearchCitiesOptions,
): Promise<readonly City[]> {
  const { limit = SEARCH_DEFAULT_LIMIT, signal } = options ?? {};

  // Clamp limit to valid range
  const clampedLimit = Math.max(
    SEARCH_MIN_LIMIT,
    Math.min(SEARCH_MAX_LIMIT, limit),
  );

  // Check online status (Req 12.2)
  if (!isOnline()) {
    throw appError.networkOffline();
  }

  // Acquire throttle token (Req 2.1, 2.8)
  try {
    await geocodingThrottle.acquire();
  } catch (error) {
    throw normalizeError(error, "nominatim");
  }

  // Issue search request
  try {
    const response = await nominatimClient.get<unknown>(NOMINATIM_SEARCH_PATH, {
      params: {
        q: query,
        format: "json",
        addressdetails: 1,
        limit: clampedLimit,
      },
      signal,
    });

    // Validate with Zod (Req 10.3, 10.4)
    const parseResult = NominatimResponseSchema.safeParse(response.data);
    if (!parseResult.success) {
      throw appError.validationFailed(parseResult.error);
    }

    const raw = parseResult.data;

    // Filter by Indonesia country_code (Req 6.3)
    const filtered = raw.filter(
      (result) => result.address?.country_code === "id",
    );

    // Map to City[] (Req 12.1: empty array when no results after filtering)
    const cities = filtered.map((result) => {
      const coords: Coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };

      return createCityFromCoords(coords, {
        name: result.name || result.display_name.split(",")[0] || "Unknown",
        displayName: result.display_name,
        country: result.address?.country || "Indonesia",
        admin1: result.address?.state,
      });
    });

    return cities;
  } catch (error) {
    throw normalizeError(error, "nominatim");
  }
}

export async function reverseGeocode(
  coords: Coordinates,
  options?: { readonly signal?: AbortSignal },
): Promise<City | null> {
  const { signal } = options ?? {};

  if (!isOnline()) {
    throw appError.networkOffline();
  }

  try {
    await geocodingThrottle.acquire();
  } catch (error) {
    throw normalizeError(error, "nominatim");
  }

  try {
    const response = await nominatimClient.get<unknown>(
      NOMINATIM_REVERSE_PATH,
      {
        params: {
          lat: coords.latitude,
          lon: coords.longitude,
          format: "json",
          addressdetails: 1,
        },
        signal,
      },
    );

    // Validate single result
    const parseResult = NominatimResponseSchema.safeParse([response.data]);
    if (!parseResult.success || parseResult.data.length === 0) {
      return null;
    }

    const result = parseResult.data[0];

    return createCityFromCoords(coords, {
      name: result.name || result.display_name.split(",")[0] || "Unknown",
      displayName: result.display_name,
      country: result.address?.country || "Indonesia",
      admin1: result.address?.state,
    });
  } catch (error) {
    throw normalizeError(error, "nominatim");
  }
}
