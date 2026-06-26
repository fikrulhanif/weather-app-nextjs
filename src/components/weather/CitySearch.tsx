/**
 * `CitySearch` — Search dengan proper z-index agar tidak tertutup
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

import { useCitySearch } from "@/hooks/use-city-search";
import { useWeather } from "@/hooks/use-weather";
import type { City } from "@/types/weather";

export interface CitySearchProps {
  readonly placeholder?: string;
}

export function CitySearch({
  placeholder = "Cari kota Indonesia...",
}: CitySearchProps) {
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
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 rounded-lg border border-gray-800 bg-gray-900 pl-10 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-indigo-500" />
        )}
      </div>

      {/* Dropdown - Will appear above map due to parent z-50 */}
      {isOpen &&
        (suggestions.length > 0 || (query.length >= 2 && !loading)) && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-gray-800 bg-[#141929] shadow-2xl overflow-hidden">
            {suggestions.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto py-1">
                {suggestions.map((city) => (
                  <li key={city.id}>
                    <button
                      onClick={() => handleSelect(city)}
                      className="w-full px-4 py-2.5 text-left transition-colors hover:bg-gray-800 flex items-center gap-3"
                    >
                      <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-white truncate">
                          {city.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {city.admin1 && `${city.admin1}, `}
                          {city.country}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-700" />
                <p className="text-sm text-gray-500">Kota tidak ditemukan</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
