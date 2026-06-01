/**
 * Default Indonesian seed cities used by the empty-state map and as a fallback
 * suggestion list before the user has interacted with City_Search.
 *
 * Coordinates are 3-decimal rounded to match the stable id derivation used by
 * the rest of the application.
 */

import type { City } from "@/types/weather";

/** Geographic centre of Indonesia, used as the default map view. */
export const INDONESIA_CENTER = {
  latitude: -2.548,
  longitude: 118.014,
} as const;

/** Default zoom level for the country-wide overview. */
export const INDONESIA_DEFAULT_ZOOM = 5;

export const DEFAULT_CITIES: readonly City[] = [
  {
    id: "-6.175:106.827",
    name: "Jakarta",
    displayName: "Jakarta, Daerah Khusus Ibukota Jakarta, Indonesia",
    country: "Indonesia",
    admin1: "Daerah Khusus Ibukota Jakarta",
    coordinates: { latitude: -6.175, longitude: 106.827 },
  },
  {
    id: "-6.917:107.619",
    name: "Bandung",
    displayName: "Bandung, Jawa Barat, Indonesia",
    country: "Indonesia",
    admin1: "Jawa Barat",
    coordinates: { latitude: -6.917, longitude: 107.619 },
  },
  {
    id: "-7.250:112.768",
    name: "Surabaya",
    displayName: "Surabaya, Jawa Timur, Indonesia",
    country: "Indonesia",
    admin1: "Jawa Timur",
    coordinates: { latitude: -7.25, longitude: 112.768 },
  },
  {
    id: "-7.795:110.369",
    name: "Yogyakarta",
    displayName: "Yogyakarta, Daerah Istimewa Yogyakarta, Indonesia",
    country: "Indonesia",
    admin1: "Daerah Istimewa Yogyakarta",
    coordinates: { latitude: -7.795, longitude: 110.369 },
  },
  {
    id: "-6.595:106.816",
    name: "Bogor",
    displayName: "Bogor, Jawa Barat, Indonesia",
    country: "Indonesia",
    admin1: "Jawa Barat",
    coordinates: { latitude: -6.595, longitude: 106.816 },
  },
];
