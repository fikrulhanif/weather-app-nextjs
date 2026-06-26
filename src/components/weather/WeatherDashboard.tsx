/**
 * `WeatherDashboard` — main composition: alerts + cards + hourly + daily.
 */

"use client";

import { RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorView } from "@/components/ui/ErrorView";
import { AlertList } from "@/components/alerts/AlertList";
import { WeatherCardGrid } from "./WeatherCardGrid";
import { DailyForecast } from "./DailyForecast";
import dynamic from "next/dynamic";

import { useWeather } from "@/hooks/use-weather";

// Dynamic import for HourlyChart to avoid SSR issues with Chart.js
const HourlyChart = dynamic(
  () =>
    import("@/components/charts/HourlyChart").then((mod) => mod.HourlyChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> },
);

export function WeatherDashboard() {
  const { selectedCity, weatherData, alerts, loading, error, refreshWeather } =
    useWeather();

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ErrorView error={error} onRetry={refreshWeather} />
        {error.kind === "network_offline" && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Tidak ada koneksi internet. Silakan periksa koneksi Anda.
          </div>
        )}
      </div>
    );
  }

  // Loading skeleton
  if (loading && !weatherData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Empty state
  if (!selectedCity && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🌤️</div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Cari Kota Indonesia
        </h3>
        <p className="text-sm text-muted-foreground">
          Gunakan kotak pencarian di atas untuk memilih kota
        </p>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* City header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {selectedCity?.name || weatherData?.city.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedCity?.admin1 && `${selectedCity.admin1}, `}
            {selectedCity?.country || "Indonesia"}
          </p>
        </div>
        <button
          onClick={refreshWeather}
          disabled={loading}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && <AlertList alerts={alerts} />}

      {/* Weather cards */}
      <WeatherCardGrid
        current={weatherData?.current || null}
        loading={loading}
      />

      {/* Hourly chart */}
      {weatherData && weatherData.hourly.length > 0 && (
        <div className="glass rounded-lg p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Forecast 24 Jam
          </h3>
          <HourlyChart hourly={weatherData.hourly} />
        </div>
      )}

      {/* Daily forecast */}
      {weatherData && weatherData.daily.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Forecast 7 Hari
          </h3>
          <DailyForecast daily={weatherData.daily} />
        </div>
      )}
    </div>
  );
}
