/**
 * `WeatherDashboard` — Main weather content dengan sections yang jelas
 */

"use client";

import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorView } from "@/components/ui/ErrorView";
import { AlertList } from "@/components/alerts/AlertList";
import { WeatherCardGrid } from "./WeatherCardGrid";
import { DailyForecast } from "./DailyForecast";
import { useWeather } from "@/hooks/use-weather";

// Dynamic import for HourlyChart
const HourlyChart = dynamic(
  () =>
    import("@/components/charts/HourlyChart").then((mod) => mod.HourlyChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg skeleton" />,
  },
);

export function WeatherDashboard() {
  const { selectedCity, weatherData, alerts, loading, error, refreshWeather } =
    useWeather();

  // Error state
  if (error) {
    return (
      <div className="weather-card p-6">
        <ErrorView error={error} onRetry={refreshWeather} />
        {error.kind === "network_offline" && (
          <div className="mt-4 rounded-lg border border-red-900/50 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            Tidak ada koneksi internet
          </div>
        )}
      </div>
    );
  }

  // Loading skeleton
  if (loading && !weatherData) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg skeleton" />
        <Skeleton className="h-64 w-full rounded-lg skeleton" />
        <Skeleton className="h-64 w-full rounded-lg skeleton" />
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* City header */}
      <div className="weather-card p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {selectedCity?.name || weatherData?.city.name}
          </h2>
          <p className="text-sm text-gray-400">
            {selectedCity?.admin1 && `${selectedCity.admin1}, `}
            {selectedCity?.country || "Indonesia"}
          </p>
        </div>
        <button
          onClick={refreshWeather}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && <AlertList alerts={alerts} />}

      {/* Weather Info Section - WRAPPED IN CONTAINER */}
      <div className="weather-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wide">
          Informasi Cuaca Saat Ini
        </h3>
        <WeatherCardGrid
          current={weatherData?.current || null}
          loading={loading}
        />
      </div>

      {/* Hourly chart */}
      {weatherData && weatherData.hourly.length > 0 && (
        <div className="weather-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wide">
            Forecast 24 Jam
          </h3>
          <HourlyChart hourly={weatherData.hourly} />
        </div>
      )}

      {/* Daily forecast */}
      {weatherData && weatherData.daily.length > 0 && (
        <div className="weather-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wide">
            Forecast 7 Hari
          </h3>
          <DailyForecast daily={weatherData.daily} />
        </div>
      )}
    </div>
  );
}
