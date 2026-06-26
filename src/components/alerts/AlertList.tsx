/**
 * `AlertList` — Compact alert badges
 */

"use client";

import { AlertTriangle, CloudRain, Wind, Sun } from "lucide-react";

import type { Alert } from "@/types/alert";

export interface AlertListProps {
  readonly alerts: readonly Alert[];
}

const iconMap = {
  heavy_rain: CloudRain,
  strong_wind: Wind,
  high_uv: Sun,
};

export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="weather-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white uppercase tracking-wide mb-3">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Peringatan
      </h3>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.kind] || AlertTriangle;
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                alert.severity === "low"
                  ? "alert-low"
                  : alert.severity === "medium"
                    ? "alert-medium"
                    : "alert-high"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{alert.title}</div>
                <div className="mt-1 text-xs opacity-90">
                  {alert.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
