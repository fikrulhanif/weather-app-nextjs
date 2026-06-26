/**
 * Zustand weather store — single source of truth for client-side state.
 *
 * Responsibilities:
 * - Hold selected city, weather data, alerts, loading/error flags.
 * - Hold favorites array (synced to localStorage under key `wai.favorites`).
 * - Expose actions: selectCity, refreshWeather, addFavorite, removeFavorite, clearError.
 * - Implement request cancellation via AbortController (Req 13.5).
 * - Persist favorites to localStorage within 100 ms of every mutation (Req 3.3, 3.5).
 * - Implement hydrate() to restore favorites from localStorage on mount (Req 3.6, 3.7, 3.8).
 */

import { create } from "zustand";

import type { City, WeatherData } from "@/types/weather";
import type { Alert } from "@/types/alert";
import type { AppError } from "@/types/error";

import { FavoritesSchema } from "@/types/schemas";
import { fetchWeather } from "@/services/weather.service";
import { evaluateAlerts, evaluateUpcomingAlerts } from "@/lib/alert-engine";
import { REFRESH_TIMEOUT_MS } from "@/constants/api";
import { MAX_FAVORITES } from "@/constants/thresholds";

// -----------------------------------------------------------------------------
// State shape
// -----------------------------------------------------------------------------

export interface WeatherStoreState {
  // Selected city and its data
  selectedCity: City | null;
  weatherData: WeatherData | null;
  alerts: readonly Alert[];
  upcomingAlerts: readonly Alert[];

  // Loading and error states
  loading: boolean;
  error: AppError | null;

  // Favorites
  favorites: readonly City[];

  // Internal request tracking
  _abortController: AbortController | null;
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export interface WeatherStoreActions {
  selectCity: (city: City) => Promise<void>;
  refreshWeather: () => Promise<void>;
  addFavorite: (city: City) => void;
  removeFavorite: (cityId: string) => void;
  clearError: () => void;
  hydrate: () => void;
}

// -----------------------------------------------------------------------------
// Store definition
// -----------------------------------------------------------------------------

type WeatherStore = WeatherStoreState & WeatherStoreActions;

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  // Initial state
  selectedCity: null,
  weatherData: null,
  alerts: [],
  upcomingAlerts: [],
  loading: false,
  error: null,
  favorites: [],
  _abortController: null,

  // Actions
  async selectCity(city: City) {
    const { _abortController } = get();

    // Cancel in-flight request (Req 13.5)
    if (_abortController) {
      _abortController.abort();
    }

    const newAbortController = new AbortController();

    set({
      selectedCity: city,
      loading: true,
      error: null,
      _abortController: newAbortController,
    });

    try {
      const weatherData = await fetchWeather(city.coordinates, {
        signal: newAbortController.signal,
      });

      // Update city name from cache if available
      const updatedCity = { ...city, name: weatherData.city.name || city.name };

      // Derive alerts from current snapshot
      const alerts = evaluateAlerts({
        rainProbabilityPct: weatherData.current.rainProbabilityPct,
        windSpeedKmh: weatherData.current.windSpeedKmh,
        uvIndex: weatherData.current.uvIndex,
        observedAt: weatherData.current.observedAt,
      });

      // Derive upcoming alerts from hourly forecast
      const upcomingAlerts = evaluateUpcomingAlerts(weatherData.hourly);

      set({
        selectedCity: updatedCity,
        weatherData,
        alerts,
        upcomingAlerts,
        loading: false,
        _abortController: null,
      });
    } catch (error: any) {
      // Ignore AbortError when request was cancelled (Req 13.5)
      if (error?.name === "AbortError" || error?.name === "CanceledError") {
        return;
      }

      set({
        loading: false,
        error: error as AppError,
        _abortController: null,
      });
    }
  },

  async refreshWeather() {
    const { selectedCity, weatherData: previousData } = get();

    if (!selectedCity) return;

    set({ loading: true, error: null });

    const timeoutId = setTimeout(() => {
      set({
        loading: false,
        error: {
          kind: "unknown",
          message: "Refresh timeout exceeded 15 seconds",
        },
      });
    }, REFRESH_TIMEOUT_MS);

    try {
      const weatherData = await fetchWeather(selectedCity.coordinates, {
        forceRefresh: true,
      });

      clearTimeout(timeoutId);

      const alerts = evaluateAlerts({
        rainProbabilityPct: weatherData.current.rainProbabilityPct,
        windSpeedKmh: weatherData.current.windSpeedKmh,
        uvIndex: weatherData.current.uvIndex,
        observedAt: weatherData.current.observedAt,
      });

      const upcomingAlerts = evaluateUpcomingAlerts(weatherData.hourly);

      set({
        weatherData,
        alerts,
        upcomingAlerts,
        loading: false,
      });
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Retain previous data on failure (Req 7.7)
      set({
        loading: false,
        error: error as AppError,
        weatherData: previousData,
      });
    }
  },

  addFavorite(city: City) {
    const { favorites } = get();

    // Dedupe by id (Req 3.2)
    if (favorites.some((fav) => fav.id === city.id)) {
      return;
    }

    // Cap at MAX_FAVORITES (Req 3.4)
    if (favorites.length >= MAX_FAVORITES) {
      // Surface error via toast (handled in hook layer)
      return;
    }

    const newFavorites = [...favorites, city];
    set({ favorites: newFavorites });
    persistFavorites(newFavorites);
  },

  removeFavorite(cityId: string) {
    const { favorites } = get();
    const newFavorites = favorites.filter((fav) => fav.id !== cityId);
    set({ favorites: newFavorites });
    persistFavorites(newFavorites);
  },

  clearError() {
    set({ error: null });
  },

  hydrate() {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("wai.favorites");

      // Missing key: default to empty array (Req 3.7)
      if (!raw) {
        set({ favorites: [] });
        return;
      }

      const parsed = JSON.parse(raw);
      const result = FavoritesSchema.safeParse(parsed);

      // Validation success (Req 3.6)
      if (result.success) {
        set({ favorites: result.data });
        return;
      }

      // Validation failure: reset to empty and remove corrupt key (Req 3.8)
      set({ favorites: [] });
      localStorage.removeItem("wai.favorites");
    } catch {
      set({ favorites: [] });
      if (typeof window !== "undefined") {
        localStorage.removeItem("wai.favorites");
      }
    }
  },
}));

// -----------------------------------------------------------------------------
// Persistence helper
// -----------------------------------------------------------------------------

function persistFavorites(favorites: readonly City[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("wai.favorites", JSON.stringify(favorites));
  } catch {
    // Silently ignore localStorage quota errors
  }
}

// -----------------------------------------------------------------------------
// Selectors (for optimized subscriptions)
// -----------------------------------------------------------------------------

export const selectSelectedCity = (state: WeatherStore) => state.selectedCity;
export const selectWeatherData = (state: WeatherStore) => state.weatherData;
export const selectActiveAlerts = (state: WeatherStore) => state.alerts;
export const selectUpcomingAlerts = (state: WeatherStore) =>
  state.upcomingAlerts;
export const selectFavorites = (state: WeatherStore) => state.favorites;
export const selectIsLoading = (state: WeatherStore) => state.loading;
export const selectError = (state: WeatherStore) => state.error;
export const selectIsFavorite = (cityId: string) => (state: WeatherStore) =>
  state.favorites.some((fav) => fav.id === cityId);
