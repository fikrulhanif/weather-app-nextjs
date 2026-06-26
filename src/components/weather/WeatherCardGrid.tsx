/**
 * `WeatherCardGrid` — Compact weather info grid tanpa individual card borders
 */

"use client";

import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Clock,
} from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  formatTemperature,
  formatHumidity,
  formatWindSpeed,
  formatUv,
  formatPrecipitation,
  formatTime,
  weatherConditionLabel,
} from "@/utils/format";
import type { CurrentWeather } from "@/types/weather";

export interface WeatherCardGridProps {
  readonly current: CurrentWeather | null;
  readonly loading: boolean;
}

export function WeatherCardGrid({ current, loading }: WeatherCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg skeleton" />
        ))}
      </div>
    );
  }

  if (!current) return null;

  const cards = [
    {
      icon: Thermometer,
      label: "Suhu",
      value: formatTemperature(current.temperatureC),
      subValue: `Terasa ${formatTemperature(current.apparentTemperatureC)}`,
      color: "text-orange-400",
    },
    {
      icon: CloudRain,
      label: weatherConditionLabel(current.condition),
      value: formatPrecipitation(current.precipitationMm),
      subValue: `${current.rainProbabilityPct}% hujan`,
      color: "text-blue-400",
    },
    {
      icon: Droplets,
      label: "Kelembaban",
      value: formatHumidity(current.humidityPct),
      subValue: null,
      color: "text-cyan-400",
    },
    {
      icon: Wind,
      label: "Angin",
      value: formatWindSpeed(current.windSpeedKmh),
      subValue: `${current.windDirectionDeg}°`,
      color: "text-teal-400",
    },
    {
      icon: Sun,
      label: "UV Index",
      value: formatUv(current.uvIndex),
      subValue: getUvLabel(current.uvIndex),
      color: "text-yellow-400",
    },
    {
      icon: Clock,
      label: "Update",
      value: formatTime(current.observedAt),
      subValue: null,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4 transition-all hover:bg-gray-900/70 hover:border-gray-700/50"
        >
          <div className="flex items-start gap-3">
            <card.icon
              className={`h-5 w-5 ${card.color} flex-shrink-0 mt-0.5`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-white truncate">
                {card.value}
              </p>
              {card.subValue && (
                <p className="mt-0.5 text-xs text-gray-500 truncate">
                  {card.subValue}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getUvLabel(uvIndex: number): string {
  if (uvIndex < 3) return "Rendah";
  if (uvIndex < 6) return "Sedang";
  if (uvIndex < 8) return "Tinggi";
  if (uvIndex < 11) return "Sangat Tinggi";
  return "Ekstrem";
}
