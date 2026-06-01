/**
 * Numeric thresholds, severity boundaries, cache TTLs, debounce delays, and
 * UX guardrails for the Weather Alert Indonesia application.
 *
 * Values come directly from the design document. Any change here must be
 * propagated to the requirements and design before code references it.
 */

// -----------------------------------------------------------------------------
// Alert thresholds (an alert fires only when observedValue > threshold)
// -----------------------------------------------------------------------------

export const RAIN_THRESHOLD_PCT = 70;
export const WIND_THRESHOLD_KMH = 30;
export const UV_THRESHOLD_INDEX = 8;

// -----------------------------------------------------------------------------
// Severity classifier boundaries
// -----------------------------------------------------------------------------

/** Rain-probability severity boundaries (high ≥ 90, medium ≥ 80, else low). */
export const RAIN_SEVERITY_HIGH_PCT = 90;
export const RAIN_SEVERITY_MEDIUM_PCT = 80;

/** Wind-speed severity boundaries (high ≥ 60, medium ≥ 45, else low). */
export const WIND_SEVERITY_HIGH_KMH = 60;
export const WIND_SEVERITY_MEDIUM_KMH = 45;

/** UV-index severity boundaries (high ≥ 11, medium ≥ 9.5, else low). */
export const UV_SEVERITY_HIGH_INDEX = 11;
export const UV_SEVERITY_MEDIUM_INDEX = 9.5;

// -----------------------------------------------------------------------------
// Caching, throttling, and debouncing
// -----------------------------------------------------------------------------

/** Weather cache TTL: 10 minutes. */
export const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

/** Coordinate rounding precision for cache keys and stable City ids. */
export const COORDINATE_PRECISION_DECIMALS = 3;

/** Token-bucket throttle for Nominatim: capacity 1, refill 1 token / 1000 ms. */
export const GEOCODING_THROTTLE_CAPACITY = 1;
export const GEOCODING_THROTTLE_REFILL_INTERVAL_MS = 1000;
export const GEOCODING_THROTTLE_QUEUE_LIMIT = 50;

/** Debounce delay before invoking Geocoding_Service after the latest keystroke. */
export const GEOCODING_DEBOUNCE_MS = 350;

/** LRU cap for the City_Search in-memory query cache. */
export const SEARCH_QUERY_CACHE_LIMIT = 100;

/** Minimum normalized query length before invoking Geocoding_Service. */
export const SEARCH_MIN_QUERY_LENGTH = 2;

/** Maximum normalized query length accepted by City_Search. */
export const SEARCH_MAX_QUERY_LENGTH = 100;

/** Default and bounds for the Nominatim result `limit` parameter. */
export const SEARCH_DEFAULT_LIMIT = 5;
export const SEARCH_MIN_LIMIT = 1;
export const SEARCH_MAX_LIMIT = 10;

// -----------------------------------------------------------------------------
// UX guardrails
// -----------------------------------------------------------------------------

/** Maximum number of favorite cities the store will accept. */
export const MAX_FAVORITES = 50;

/** Maximum number of favorite markers rendered on the map. */
export const MAX_MAP_MARKERS = 100;

/** Coordinate-equality tolerance for marker deduplication on the map. */
export const MAP_COORDINATE_EPSILON_DEG = 0.0001;
