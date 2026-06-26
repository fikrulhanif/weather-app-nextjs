/**
 * Weather_Service — fetches, validates, and caches Open-Meteo weather data.
 *
 * Responsibilities:
 * - Issue HTTP GET requests to Open-Meteo with coordinates and required params.
 * - Validate raw responses with `OpenMeteoResponseSchema` (Req 10.1, 10.2).
 * - Map WMO weather codes to `WeatherCondition` enum values.
 * - Cache successful responses in a module-scoped TTL cache keyed by rounded
 *   coordinates (Req 1.1, 1.2, 1.3).
 * - Honor `forceRefresh` to bypass cache and re-fetch (Req 1.5).
 * - Normalize all failures into typed `AppError` variants (Req 10.2, 12.2, 12.4, 12.7).
 */

import type { Coordinates, WeatherData } from "@/types/weather";
import type { OpenMeteoResponse } from "@/types/schemas";

import { OPEN_METEO_FORECAST_PATH } from "@/constants/api";
import { WEATHER_CACHE_TTL_MS } from "@/constants/thresholds";
import { createTtlCache } from "@/lib/cache";
import { appError, normalizeError } from "@/lib/error";
import { isOnline, openMeteoClient } from "@/lib/http";
import { OpenMeteoResponseSchema } from "@/types/schemas";
import { round3, cityIdFromCoords } from "@/utils/city";
import { weatherCodeToCondition } from "@/utils/weather-code";

// -----------------------------------------------------------------------------
// Module-scoped cache
// -----------------------------------------------------------------------------

const weatherCache = createTtlCache<WeatherData>({
  ttlMs: WEATHER_CACHE_TTL_MS,
});

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export interface FetchWeatherOptions {
  readonly forceRefresh?: boolean;
  readonly signal?: AbortSignal;
}

export async function fetchWeather(
  coords: Coordinates,
  options?: FetchWeatherOptions,
): Promise<WeatherData> {
  const { forceRefresh = false, signal } = options ?? {};

  // Check online status before issuing request (Req 12.2)
  if (!isOnline()) {
    throw appError.networkOffline();
  }

  const cacheKey = cityIdFromCoords(coords);

  // Serve cache hit unless forceRefresh is true (Req 1.2, 1.5)
  if (!forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached) return cached;
  }

  // Cache miss or forceRefresh: issue HTTP request (Req 1.6)
  try {
    const response = await openMeteoClient.get<unknown>(
      OPEN_METEO_FORECAST_PATH,
      {
        params: {
          latitude: round3(coords.latitude),
          longitude: round3(coords.longitude),
          current: [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "uv_index",
          ].join(","),
          hourly: [
            "temperature_2m",
            "precipitation",
            "precipitation_probability",
            "wind_speed_10m",
            "uv_index",
          ].join(","),
          daily: [
            "temperature_2m_min",
            "temperature_2m_max",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "uv_index_max",
            "weather_code",
          ].join(","),
          timezone: "auto",
          forecast_days: 7,
        },
        signal,
      },
    );

    // Validate with Zod (Req 10.1, 10.2)
    const parseResult = OpenMeteoResponseSchema.safeParse(response.data);
    if (!parseResult.success) {
      throw appError.validationFailed(parseResult.error);
    }

    const raw = parseResult.data;
    const weatherData = mapToWeatherData(coords, raw);

    // Write cache on success (Req 1.7)
    weatherCache.set(cacheKey, weatherData);

    return weatherData;
  } catch (error) {
    // Preserve existing cache entry on failure (Req 1.8)
    throw normalizeError(error, "open-meteo");
  }
}

export function invalidateCache(coords?: Coordinates): void {
  if (coords) {
    weatherCache.delete(cityIdFromCoords(coords));
  } else {
    weatherCache.clear();
  }
}

// -----------------------------------------------------------------------------
// Mapping helpers
// -----------------------------------------------------------------------------

function mapToWeatherData(
  coords: Coordinates,
  raw: OpenMeteoResponse,
): WeatherData {
  const city = {
    id: cityIdFromCoords(coords),
    name: "",
    displayName: "",
    country: "Indonesia",
    coordinates: {
      latitude: round3(coords.latitude),
      longitude: round3(coords.longitude),
    },
  };

  // Map current weather
  const current = {
    temperatureC: raw.current.temperature_2m,
    apparentTemperatureC: raw.current.apparent_temperature,
    humidityPct: raw.current.relative_humidity_2m,
    windSpeedKmh: raw.current.wind_speed_10m,
    windDirectionDeg: raw.current.wind_direction_10m,
    precipitationMm: raw.current.precipitation,
    rainProbabilityPct: 0, // Current doesn't provide this; default to 0
    uvIndex: raw.current.uv_index,
    condition: weatherCodeToCondition(raw.current.weather_code),
    weatherCode: raw.current.weather_code,
    observedAt: raw.current.time,
  };

  // Map hourly (up to 24 entries)
  const hourly = raw.hourly.time.slice(0, 24).map((timestamp, i) => ({
    timestamp,
    temperatureC: raw.hourly.temperature_2m[i],
    precipitationMm: raw.hourly.precipitation[i],
    rainProbabilityPct: raw.hourly.precipitation_probability[i],
    windSpeedKmh: raw.hourly.wind_speed_10m[i],
    uvIndex: raw.hourly.uv_index[i],
  }));

  // Map daily (up to 7 entries)
  const daily = raw.daily.time.slice(0, 7).map((date, i) => ({
    date,
    tempMinC: raw.daily.temperature_2m_min[i],
    tempMaxC: raw.daily.temperature_2m_max[i],
    precipitationSumMm: raw.daily.precipitation_sum[i],
    rainProbabilityMaxPct: raw.daily.precipitation_probability_max[i],
    windSpeedMaxKmh: raw.daily.wind_speed_10m_max[i],
    uvIndexMax: raw.daily.uv_index_max[i],
    condition: weatherCodeToCondition(raw.daily.weather_code[i]),
    weatherCode: raw.daily.weather_code[i],
  }));

  return {
    city,
    current,
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
