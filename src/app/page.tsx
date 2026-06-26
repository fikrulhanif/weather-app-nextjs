/**
 * Home page — Weather Alert Indonesia dashboard
 * Layout: Header with search + main grid (dashboard, map, favorites)
 * Responsive: single column mobile, 2-col tablet, 3-col desktop
 */

"use client";

import dynamic from "next/dynamic";

import { Header } from "@/components/ui/Header";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { CitySearch } from "@/components/weather/CitySearch";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { FavoritesPanel } from "@/components/weather/FavoritesPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWeather } from "@/hooks/use-weather";
import { useFavorites } from "@/hooks/use-favorites";

// Dynamic import for WeatherMap (SSR-safe)
const WeatherMap = dynamic(
  () => import("@/components/map/WeatherMap").then((mod) => mod.WeatherMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />,
  },
);

export default function Home() {
  const { selectedCity, selectCity } = useWeather();
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with search */}
      <Header>
        <div className="w-full max-w-md">
          <CitySearch />
        </div>
      </Header>

      {/* Main content grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Dashboard - main content */}
          <div className="lg:col-span-8">
            <WeatherDashboard />
          </div>

          {/* Sidebar - Map + Favorites */}
          <div className="space-y-6 lg:col-span-4">
            {/* Map with error boundary */}
            <ErrorBoundary
              fallback={
                <div className="glass flex h-96 items-center justify-center rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Peta tidak tersedia
                  </p>
                </div>
              }
            >
              <WeatherMap
                activeCity={selectedCity}
                favorites={favorites}
                onMarkerClick={selectCity}
              />
            </ErrorBoundary>

            {/* Favorites panel */}
            <FavoritesPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
