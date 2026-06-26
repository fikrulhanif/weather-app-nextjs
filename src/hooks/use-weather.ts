/**
 * `useWeather` — binds the Zustand weather store to React lifecycle.
 *
 * Exposes the selected city, weather data, alerts, loading/error states, and
 * action handles (selectCity, refreshWeather) for use by dashboard components.
 */

"use client";

import {
  useWeatherStore,
  selectSelectedCity,
  selectWeatherData,
  selectActiveAlerts,
  selectUpcomingAlerts,
  selectIsLoading,
  selectError,
} from "@/store/weather-store";

export function useWeather() {
  const selectedCity = useWeatherStore(selectSelectedCity);
  const weatherData = useWeatherStore(selectWeatherData);
  const alerts = useWeatherStore(selectActiveAlerts);
  const upcomingAlerts = useWeatherStore(selectUpcomingAlerts);
  const loading = useWeatherStore(selectIsLoading);
  const error = useWeatherStore(selectError);

  const selectCity = useWeatherStore((state) => state.selectCity);
  const refreshWeather = useWeatherStore((state) => state.refreshWeather);
  const clearError = useWeatherStore((state) => state.clearError);

  return {
    selectedCity,
    weatherData,
    alerts,
    upcomingAlerts,
    loading,
    error,
    selectCity,
    refreshWeather,
    clearError,
  };
}
