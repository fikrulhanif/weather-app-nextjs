/**
 * `useCitySearch` — debounced city search with LRU query cache.
 *
 * Responsibilities:
 * - Debounce user input by 350 ms after the latest keystroke (Req 2.3).
 * - Skip invocation when normalized query length is < 2 or > 100 (Req 6.1).
 * - Normalize query with `normalizeQuery` (Req 2.5, 6.5).
 * - Maintain an LRU query cache capped at 100 entries (Req 2.6).
 * - Call `geocodingService.searchCities` on cache miss.
 * - Surface `rate_limited` and generic failures via toast (Req 6.6).
 * - Display "Kota tidak ditemukan" empty state when filtered results are empty (Req 6.7).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

import { searchCities } from "@/services/geocoding.service";
import { normalizeQuery } from "@/utils/city";
import {
  GEOCODING_DEBOUNCE_MS,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_MAX_QUERY_LENGTH,
  SEARCH_QUERY_CACHE_LIMIT,
} from "@/constants/thresholds";
import type { City } from "@/types/weather";
import type { AppError } from "@/types/error";

// -----------------------------------------------------------------------------
// LRU cache implementation
// -----------------------------------------------------------------------------

class LRUCache<V> {
  private cache = new Map<string, V>();
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: string): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict least recently used if at capacity
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// -----------------------------------------------------------------------------
// Hook implementation
// -----------------------------------------------------------------------------

export function useCitySearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<readonly City[]>([]);
  const [loading, setLoading] = useState(false);

  const queryCache = useRef(
    new LRUCache<readonly City[]>(SEARCH_QUERY_CACHE_LIMIT),
  );
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const search = useCallback(async (normalizedQuery: string) => {
    // Check cache first (Req 2.4)
    const cached = queryCache.current.get(normalizedQuery);
    if (cached) {
      setSuggestions(cached);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    try {
      setLoading(true);

      const cities = await searchCities(normalizedQuery, {
        signal: abortController.current.signal,
      });

      // Cache the result
      queryCache.current.set(normalizedQuery, cities);

      // Empty filtered list: display empty state (Req 6.7, 12.8)
      if (cities.length === 0) {
        setSuggestions([]);
      } else {
        setSuggestions(cities);
      }

      setLoading(false);
    } catch (error: any) {
      // Ignore AbortError
      if (error?.name === "AbortError" || error?.name === "CanceledError") {
        return;
      }

      setLoading(false);
      setSuggestions([]);

      const appError = error as AppError;

      // Rate-limited toast (Req 6.6)
      if (appError.kind === "rate_limited") {
        toast.warning("Mohon tunggu sebentar");
        return;
      }

      // Generic failure toast (Req 6.6)
      toast.error("Gagal mencari kota");
    }
  }, []);

  // Debounced search effect (Req 2.3)
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const normalized = normalizeQuery(query);

    // Skip if length < 2 or > 100 (Req 6.1)
    if (
      normalized.length < SEARCH_MIN_QUERY_LENGTH ||
      normalized.length > SEARCH_MAX_QUERY_LENGTH
    ) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Debounce: schedule search after 350 ms (Req 2.3)
    debounceTimer.current = setTimeout(() => {
      search(normalized);
    }, GEOCODING_DEBOUNCE_MS);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, search]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    loading,
    clearSuggestions,
  };
}
