/**
 * `FavoritesPanel` — Compact favorites list
 */

"use client";

import { Star, X, Plus } from "lucide-react";

import { useFavorites } from "@/hooks/use-favorites";
import { useWeather } from "@/hooks/use-weather";

export function FavoritesPanel() {
  const { favorites, removeFavorite, addFavorite } = useFavorites();
  const { selectCity, selectedCity } = useWeather();

  const handleAddCurrent = () => {
    if (selectedCity) {
      addFavorite(selectedCity);
    }
  };

  const isCurrentFavorite =
    selectedCity && favorites.some((fav) => fav.id === selectedCity.id);

  return (
    <div className="weather-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-wide">
          <Star className="h-4 w-4 text-yellow-500" />
          Favorit
        </h3>
        {selectedCity && !isCurrentFavorite && favorites.length < 50 && (
          <button
            onClick={handleAddCurrent}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <Plus className="h-3 w-3" />
            Tambah
          </button>
        )}
      </div>

      {/* List */}
      {favorites.length === 0 ? (
        <div className="text-center py-6">
          <Star className="mx-auto mb-2 h-8 w-8 text-gray-700" />
          <p className="text-sm text-gray-500">Belum ada kota favorit</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {favorites.map((city) => {
            const isActive = selectedCity?.id === city.id;
            return (
              <div
                key={city.id}
                className={`group flex items-center justify-between rounded-lg p-2.5 transition-colors ${
                  isActive
                    ? "bg-indigo-600/20 border border-indigo-600/50"
                    : "bg-gray-800/30 border border-transparent hover:bg-gray-800/50"
                }`}
              >
                <button
                  onClick={() => selectCity(city)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="font-medium text-sm text-white truncate">
                    {city.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {city.admin1}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(city.id);
                  }}
                  className="rounded-md p-1.5 text-gray-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100 flex-shrink-0"
                  aria-label="Hapus dari favorit"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter */}
      {favorites.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800 text-center text-xs text-gray-500">
          {favorites.length} / 50 kota
        </div>
      )}
    </div>
  );
}
