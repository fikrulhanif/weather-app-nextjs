/**
 * `FavoritesPanel` — selectable favorites with remove buttons.
 */

"use client";

import { Star, X } from "lucide-react";

import { useFavorites } from "@/hooks/use-favorites";
import { useWeather } from "@/hooks/use-weather";

export function FavoritesPanel() {
  const { favorites, removeFavorite } = useFavorites();
  const { selectCity, selectedCity } = useWeather();

  if (favorites.length === 0) {
    return (
      <div className="glass rounded-lg p-6 text-center">
        <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Belum ada kota favorit</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Star className="h-4 w-4" />
        Kota Favorit
      </h3>
      <div className="space-y-2">
        {favorites.map((city) => {
          const isActive = selectedCity?.id === city.id;
          return (
            <div
              key={city.id}
              className={`glass group flex items-center justify-between rounded-lg p-3 transition-all ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/30"
              }`}
            >
              <button
                onClick={() => selectCity(city)}
                className="flex-1 text-left"
              >
                <div className="font-medium text-sm text-foreground">
                  {city.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {city.admin1 && `${city.admin1}, `}
                  {city.country}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(city.id);
                }}
                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Hapus dari favorit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
