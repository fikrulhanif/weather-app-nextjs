/**
 * Third-party API endpoints, headers, and request-timeout budgets.
 *
 * The `User-Agent` header value is mandated by the Nominatim usage policy and
 * must remain a descriptive, contactable string. Timeouts are split between
 * service-level requests (10 s) and search-only requests (5 s) so the city
 * search path remains responsive even when geocoding is slow.
 */

export const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1";
export const OPEN_METEO_FORECAST_PATH = "/forecast";

export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
export const NOMINATIM_SEARCH_PATH = "/search";
export const NOMINATIM_REVERSE_PATH = "/reverse";

export const USER_AGENT = "WeatherAlertIndonesia/1.0 (contact: project-owner)";

/** Default Accept-Language header for Indonesian-locale results. */
export const ACCEPT_LANGUAGE = "id,en";

/** Service-level request timeout for Open-Meteo and other long-running calls. */
export const SERVICE_REQUEST_TIMEOUT_MS = 10_000;

/** Tighter timeout for the city-search dropdown to keep the input responsive. */
export const SEARCH_REQUEST_TIMEOUT_MS = 5_000;

/** Refresh action upper bound; the store gives up if the refresh exceeds this. */
export const REFRESH_TIMEOUT_MS = 15_000;
