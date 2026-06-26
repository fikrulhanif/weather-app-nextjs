/**
 * `DailyForecast` — 7-day forecast dengan text yang kontras
 */

"use client";

import { Calendar } from "lucide-react";

import {
  formatDate,
  formatTemperature,
  weatherConditionLabel,
} from "@/utils/format";
import type { DailyPoint } from "@/types/weather";

export interface DailyForecastProps {
  readonly daily: readonly DailyPoint[];
}

export function DailyForecast({ daily }: DailyForecastProps) {
  if (daily.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-gray-900/30 border border-gray-800/50 p-6">
        <Calendar className="mr-2 h-5 w-5 text-gray-600" />
        <span className="text-sm text-gray-500">
          Tidak ada data forecast harian
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {daily.map((day, i) => (
        <div
          key={day.date}
          className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3 transition-all hover:bg-gray-900/70 hover:border-gray-700/50"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm text-white">
                {i === 0 ? "Hari Ini" : formatDate(day.date)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">
                {weatherConditionLabel(day.condition)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-semibold text-white text-base">
                {formatTemperature(day.tempMaxC)}
              </span>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400 text-base">
                {formatTemperature(day.tempMinC)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
