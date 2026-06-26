/**
 * `DailyForecast` — 7-day cards showing min/max temp and condition.
 */

"use client";

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
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-card/50 text-sm text-muted-foreground">
        Tidak ada data forecast harian
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {daily.map((day, i) => (
        <div
          key={day.date}
          className="glass flex items-center justify-between rounded-lg p-3 transition-shadow hover:shadow-md"
        >
          <div className="flex-1">
            <div className="font-medium text-sm text-foreground">
              {i === 0 ? "Hari Ini" : formatDate(day.date)}
            </div>
            <div className="text-xs text-muted-foreground">
              {weatherConditionLabel(day.condition)}
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="text-sm">
              <span className="font-semibold text-foreground">
                {formatTemperature(day.tempMaxC)}
              </span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-muted-foreground">
                {formatTemperature(day.tempMinC)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
