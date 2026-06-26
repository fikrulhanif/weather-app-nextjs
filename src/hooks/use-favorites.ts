/**
 * `useFavorites` — binds favorites slice to React lifecycle with toast feedback.
 *
 * Exposes the favorites array, add/remove actions, and isFavorite predicate.
 * Triggers toast notifications on add/remove and on the limit-reached path.
 */

"use client";

import { toast } from "sonner";

import { useWeatherStore, selectFavorites } from "@/store/weather-store";
import { MAX_FAVORITES } from "@/constants/thresholds";
import type { City } from "@/types/weather";

export function useFavorites() {
  const favorites = useWeatherStore(selectFavorites);

  const addFavorite = (city: City) => {
    const currentFavorites = useWeatherStore.getState().favorites;

    // Check for duplicate
    if (currentFavorites.some((fav) => fav.id === city.id)) {
      toast.info("Kota sudah ada di favorit");
      return;
    }

    // Check for capacity
    if (currentFavorites.length >= MAX_FAVORITES) {
      toast.error(`Maksimal ${MAX_FAVORITES} kota favorit`);
      return;
    }

    useWeatherStore.getState().addFavorite(city);
    toast.success(`${city.name} ditambahkan ke favorit`);
  };

  const removeFavorite = (cityId: string) => {
    const city = useWeatherStore
      .getState()
      .favorites.find((fav) => fav.id === cityId);

    useWeatherStore.getState().removeFavorite(cityId);

    if (city) {
      toast.success(`${city.name} dihapus dari favorit`);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
  };
}
