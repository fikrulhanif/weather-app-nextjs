/**
 * `WeatherCardGrid` — cards for temp, humidity, wind, UV, precipitation, last update.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
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
    },
    {
      icon: CloudRain,
      label: weatherConditionLabel(current.condition),
      value: formatPrecipitation(current.precipitationMm),
      subValue: `${current.rainProbabilityPct}% kemungkinan hujan`,
    },
    {
      icon: Droplets,
      label: "Kelembaban",
      value: formatHumidity(current.humidityPct),
      subValue: null,
    },
    {
      icon: Wind,
      label: "Angin",
      value: formatWindSpeed(current.windSpeedKmh),
      subValue: `Arah ${current.windDirectionDeg}°`,
    },
    {
      icon: Sun,
      label: "Indeks UV",
      value: formatUv(current.uvIndex),
      subValue: getUvLabel(current.uvIndex),
    },
    {
      icon: Clock,
      label: "Diperbarui",
      value: formatTime(current.observedAt),
      subValue: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="glass rounded-lg p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {card.value}
              </p>
              {card.subValue && (
                <p className="mt-1 text-xs text-muted-foreground">
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
