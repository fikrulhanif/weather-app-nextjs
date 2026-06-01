/**
 * Zod schemas for runtime validation at service boundaries.
 *
 * Two groups of schemas live here:
 *
 * 1. **Upstream response schemas** — `OpenMeteoResponseSchema` and
 *    `NominatimResponseSchema` validate the raw payloads returned by the
 *    third-party APIs. Conversion to domain types (`WeatherData`, `City`)
 *    is performed by the service layer after a successful parse.
 * 2. **Persisted-state schemas** — `CitySchema` and `FavoritesSchema` validate
 *    values rehydrated from `localStorage` so corrupted or stale data cannot
 *    leak into the in-memory store.
 *
 * Numeric ranges, percentage clamps, and lat/lon bounds match the validation
 * rules section of the design document.
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// Open-Meteo raw response schemas
// -----------------------------------------------------------------------------

export const OpenMeteoCurrentSchema = z.object({
  time: z.string(),
  temperature_2m: z.number(),
  apparent_temperature: z.number(),
  relative_humidity_2m: z.number().min(0).max(100),
  precipitation: z.number().min(0),
  weather_code: z.number().int().min(0),
  wind_speed_10m: z.number().min(0),
  wind_direction_10m: z.number().min(0).max(360),
  uv_index: z.number().min(0),
});

export const OpenMeteoHourlySchema = z.object({
  time: z.array(z.string()).min(1),
  temperature_2m: z.array(z.number()),
  precipitation: z.array(z.number().min(0)),
  precipitation_probability: z.array(z.number().min(0).max(100)),
  wind_speed_10m: z.array(z.number().min(0)),
  uv_index: z.array(z.number().min(0)),
});

export const OpenMeteoDailySchema = z.object({
  time: z.array(z.string()).min(1),
  temperature_2m_min: z.array(z.number()),
  temperature_2m_max: z.array(z.number()),
  precipitation_sum: z.array(z.number().min(0)),
  precipitation_probability_max: z.array(z.number().min(0).max(100)),
  wind_speed_10m_max: z.array(z.number().min(0)),
  uv_index_max: z.array(z.number().min(0)),
  weather_code: z.array(z.number().int().min(0)),
});

export const OpenMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  current: OpenMeteoCurrentSchema,
  hourly: OpenMeteoHourlySchema,
  daily: OpenMeteoDailySchema,
});

export type OpenMeteoCurrent = z.infer<typeof OpenMeteoCurrentSchema>;
export type OpenMeteoHourly = z.infer<typeof OpenMeteoHourlySchema>;
export type OpenMeteoDaily = z.infer<typeof OpenMeteoDailySchema>;
export type OpenMeteoResponse = z.infer<typeof OpenMeteoResponseSchema>;

// -----------------------------------------------------------------------------
// Nominatim raw response schemas
// -----------------------------------------------------------------------------

export const NominatimAddressSchema = z
  .object({
    country: z.string().optional(),
    country_code: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    town: z.string().optional(),
    village: z.string().optional(),
  })
  .optional();

export const NominatimResultSchema = z.object({
  place_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  class: z.string().optional(),
  address: NominatimAddressSchema,
});

export const NominatimResponseSchema = z.array(NominatimResultSchema);

export type NominatimResult = z.infer<typeof NominatimResultSchema>;
export type NominatimResponse = z.infer<typeof NominatimResponseSchema>;

// -----------------------------------------------------------------------------
// Persisted-state schemas
// -----------------------------------------------------------------------------

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const CitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  country: z.string().min(1),
  admin1: z.string().optional(),
  coordinates: CoordinatesSchema,
});

/** Favorites array capped at 50 entries (UX guardrail). */
export const FavoritesSchema = z.array(CitySchema).max(50);

export type CoordinatesDTO = z.infer<typeof CoordinatesSchema>;
export type CityDTO = z.infer<typeof CitySchema>;
export type FavoritesDTO = z.infer<typeof FavoritesSchema>;
