/**
 * `CitySearch` — debounced autocomplete for Indonesian cities via Nominatim.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

import { useCitySearch } from "@/hooks/use-city-search";
import { useWeather } from "@/hooks/use-weather";
import type { City } from "@/types/weather";

export interface CitySearchProps {
  readonly placeholder?: string;
}

export function CitySearch({ placeholder = "Cari kota..." }: CitySearchProps) {
  const { query, setQuery, suggestions, loading, clearSuggestions } =
    useCitySearch();
  const { selectCity } = useWeather();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: City) => {
    selectCity(city);
    setQuery("");
    clearSuggestions();
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen &&
        (suggestions.length > 0 || (query.length >= 2 && !loading)) && (
          <div className="absolute top-full z-50 mt-2 w-full rounded-md border border-border bg-card shadow-lg">
            {suggestions.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto py-1">
                {suggestions.map((city) => (
                  <li key={city.id}>
                    <button
                      onClick={() => handleSelect(city)}
                      className="w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {city.admin1 && `${city.admin1}, `}
                        {city.country}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Kota tidak ditemukan
              </div>
            )}
          </div>
        )}
    </div>
  );
}
