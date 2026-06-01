/**
 * Domain types for the Weather Alert Indonesia application.
 *
 * These types describe the in-memory shape of weather data after it has
 * been validated and normalized at the service boundary. All fields are
 * `readonly` so that downstream consumers (store, hooks, components) can
 * trust referential stability without defensive copies.
 */

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface City {
  /** Stable id derived from `${round3(latitude)}:${round3(longitude)}`. */
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly country: string;
  readonly admin1?: string;
  readonly coordinates: Coordinates;
}

export type WeatherCondition =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy_rain"
  | "thunderstorm"
  | "snow"
  | "unknown";

export interface CurrentWeather {
  readonly temperatureC: number;
  readonly apparentTemperatureC: number;
  readonly humidityPct: number;
  readonly windSpeedKmh: number;
  readonly windDirectionDeg: number;
  readonly precipitationMm: number;
  readonly rainProbabilityPct: number;
  readonly uvIndex: number;
  readonly condition: WeatherCondition;
  readonly weatherCode: number;
  /** ISO 8601 UTC timestamp emitted by Open-Meteo for the current observation. */
  readonly observedAt: string;
}

export interface HourlyPoint {
  /** ISO 8601 timestamp at hourly cadence. */
  readonly timestamp: string;
  readonly temperatureC: number;
  readonly precipitationMm: number;
  readonly rainProbabilityPct: number;
  readonly windSpeedKmh: number;
  readonly uvIndex: number;
}

export interface DailyPoint {
  /** ISO 8601 calendar date (YYYY-MM-DD) anchored to local timezone. */
  readonly date: string;
  readonly tempMinC: number;
  readonly tempMaxC: number;
  readonly precipitationSumMm: number;
  readonly rainProbabilityMaxPct: number;
  readonly windSpeedMaxKmh: number;
  readonly uvIndexMax: number;
  readonly condition: WeatherCondition;
  readonly weatherCode: number;
}

export interface WeatherData {
  readonly city: City;
  readonly current: CurrentWeather;
  /** Up to 24 entries spaced at 1-hour cadence, ordered by ascending timestamp. */
  readonly hourly: readonly HourlyPoint[];
  /** Up to 7 entries spaced at 1-day cadence, ordered by ascending date. */
  readonly daily: readonly DailyPoint[];
  /** ISO 8601 timestamp recorded when the service stored this value in the cache. */
  readonly fetchedAt: string;
}
