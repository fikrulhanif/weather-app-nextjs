/**
 * Home page — Clean, professional weather dashboard
 */

"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/ui/Header";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { CitySearch } from "@/components/weather/CitySearch";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { FavoritesPanel } from "@/components/weather/FavoritesPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWeather } from "@/hooks/use-weather";
import { useFavorites } from "@/hooks/use-favorites";
import type { City } from "@/types/weather";

// Dynamic import for WeatherMap (SSR-safe)
const WeatherMap = dynamic(
  () => import("@/components/map/WeatherMap").then((mod) => mod.WeatherMap),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[300px] w-full rounded-lg skeleton" />
    ),
  },
);

// Default city: Jakarta
const DEFAULT_CITY: City = {
  id: "-6.175:106.827",
  name: "Jakarta",
  displayName: "Jakarta, Indonesia",
  coordinates: { latitude: -6.1751, longitude: 106.8272 },
  country: "Indonesia",
  admin1: "Jakarta",
};

export default function Home() {
  const { selectedCity, selectCity, loading } = useWeather();
  const { favorites } = useFavorites();

  // Auto-load Jakarta on first mount
  useEffect(() => {
    if (!selectedCity && !loading) {
      selectCity(DEFAULT_CITY);
    }
  }, [selectedCity, loading, selectCity]);

  return (
    <div className="min-h-screen bg-[#0A0F19]">
      {/* Header */}
      <Header>
        <CitySearch />
      </Header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Dashboard (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <WeatherDashboard />
          </div>

          {/* Right Column - Sidebar (1/3 width on desktop) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map */}
            <ErrorBoundary
              fallback={
                <div className="weather-card flex h-[300px] items-center justify-center p-6">
                  <p className="text-sm text-gray-500">Peta tidak tersedia</p>
                </div>
              }
            >
              <WeatherMap
                activeCity={selectedCity}
                favorites={favorites}
                onMarkerClick={selectCity}
              />
            </ErrorBoundary>

            {/* Favorites */}
            <FavoritesPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
