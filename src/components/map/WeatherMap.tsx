/**
 * `WeatherMap` — Leaflet map with markers for active city and favorites.
 * Loaded via `next/dynamic` with `{ ssr: false }` to avoid SSR issues.
 */

"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { City } from "@/types/weather";

export interface WeatherMapProps {
  readonly activeCity: City | null;
  readonly favorites: readonly City[];
  readonly onMarkerClick?: (city: City) => void;
}

export function WeatherMap({
  activeCity,
  favorites,
  onMarkerClick,
}: WeatherMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Dynamic import of Leaflet (client-side only)
    import("leaflet").then((L) => {
      if (mapRef.current) return; // Already initialized

      // Initialize map centered on Indonesia
      const map = L.map(containerRef.current!, {
        center: [-2.5, 118.0],
        zoom: 5,
        zoomControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Fix icon paths for Leaflet in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = mapRef.current!;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Collect all cities to display
      const citiesToShow: Array<{ city: City; isActive: boolean }> = [];

      if (activeCity && isValidCoordinates(activeCity.coordinates)) {
        citiesToShow.push({ city: activeCity, isActive: true });
      }

      favorites.forEach((fav) => {
        if (
          isValidCoordinates(fav.coordinates) &&
          !isDuplicate(fav, activeCity)
        ) {
          citiesToShow.push({ city: fav, isActive: false });
        }
      });

      // Deduplicate by proximity (<0.0001 degrees)
      const deduplicated = deduplicateByProximity(citiesToShow);

      // Add markers
      deduplicated.forEach(({ city, isActive }) => {
        const { latitude, longitude } = city.coordinates;

        // Create custom icon for active city
        const icon = isActive
          ? L.divIcon({
              className: "custom-marker-active",
              html: `<div style="background-color: hsl(var(--primary)); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })
          : L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              iconRetinaUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
              shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            });

        const marker = L.marker([latitude, longitude], { icon })
          .addTo(map)
          .bindPopup(`<b>${city.name}</b><br>${city.admin1 || ""}`);

        // Handle click with debouncing (max 1 click per 200ms)
        marker.on("click", () => {
          if (clickTimeoutRef.current) return;

          onMarkerClick?.(city);

          clickTimeoutRef.current = setTimeout(() => {
            clickTimeoutRef.current = null;
          }, 200);
        });

        markersRef.current.set(city.id, marker);
      });

      // Pan to active city if present
      if (activeCity && isValidCoordinates(activeCity.coordinates)) {
        map.setView(
          [activeCity.coordinates.latitude, activeCity.coordinates.longitude],
          10,
        );
      }
    });
  }, [activeCity, favorites, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className="h-96 w-full rounded-lg overflow-hidden"
      style={{ minHeight: "384px" }}
    />
  );
}

// Validate coordinate ranges
function isValidCoordinates(coords: {
  latitude: number;
  longitude: number;
}): boolean {
  const { latitude, longitude } = coords;
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

// Check if two cities are the same (by id)
function isDuplicate(city: City, other: City | null): boolean {
  return other !== null && city.id === other.id;
}

// Deduplicate cities that are within 0.0001 degrees of each other
function deduplicateByProximity(
  cities: Array<{ city: City; isActive: boolean }>,
): Array<{ city: City; isActive: boolean }> {
  const result: Array<{ city: City; isActive: boolean }> = [];

  cities.forEach((current) => {
    const isDupe = result.some(
      (existing) =>
        Math.abs(
          existing.city.coordinates.latitude -
            current.city.coordinates.latitude,
        ) < 0.0001 &&
        Math.abs(
          existing.city.coordinates.longitude -
            current.city.coordinates.longitude,
        ) < 0.0001,
    );

    if (!isDupe) {
      result.push(current);
    }
  });

  return result;
}
