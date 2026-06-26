/**
 * HTTP client factory and pre-configured axios instances for Open-Meteo and
 * Nominatim.
 *
 * All outbound requests check `navigator.onLine` before issuing the call and
 * are wrapped in a timeout so hanging requests don't block the UI. Network
 * failures and timeouts are normalized to `AppError` with `kind: "network_offline"`
 * at the service boundary.
 */

import axios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";

import {
  NOMINATIM_BASE_URL,
  OPEN_METEO_BASE_URL,
  SERVICE_REQUEST_TIMEOUT_MS,
  USER_AGENT,
} from "@/constants/api";

export interface HttpClientOptions extends CreateAxiosDefaults {
  /** Base URL for the API. */
  readonly baseURL: string;
  /** Request timeout in milliseconds. */
  readonly timeout?: number;
}

/**
 * Create a configured axios instance with the given base URL and timeout.
 * The instance is reused across all requests to the same API.
 */
export function createHttpClient(options: HttpClientOptions): AxiosInstance {
  return axios.create({
    ...options,
    timeout: options.timeout ?? SERVICE_REQUEST_TIMEOUT_MS,
  });
}

/**
 * Pre-configured axios instance for Open-Meteo API calls.
 * Timeout defaults to 10 seconds (SERVICE_REQUEST_TIMEOUT_MS).
 */
export const openMeteoClient = createHttpClient({
  baseURL: OPEN_METEO_BASE_URL,
});

/**
 * Pre-configured axios instance for Nominatim API calls.
 * Includes the mandatory `User-Agent` header per Nominatim usage policy (Req 2.2).
 * Timeout defaults to 10 seconds (SERVICE_REQUEST_TIMEOUT_MS).
 */
export const nominatimClient = createHttpClient({
  baseURL: NOMINATIM_BASE_URL,
  headers: {
    "User-Agent": USER_AGENT,
  },
});

/**
 * Check if the browser is online before issuing an HTTP request.
 * Returns `true` if `navigator.onLine` is true or if the API is unavailable
 * (SSR context). Services should call this before `axios.get/post` and throw
 * `appError.networkOffline()` if it returns `false`.
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true; // SSR fallback
  return navigator.onLine;
}
