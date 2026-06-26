/**
 * `AlertList` — renders color-coded alert badges with Framer Motion entrance.
 */

"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import type { Alert } from "@/types/alert";
import { cn } from "@/utils/cn";

export interface AlertListProps {
  readonly alerts: readonly Alert[];
}

export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <AlertTriangle className="h-4 w-4" />
        Peringatan Cuaca
      </h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-md border p-3",
              alert.severity === "low" && "alert-low",
              alert.severity === "medium" && "alert-medium",
              alert.severity === "high" && "alert-high",
            )}
          >
            <div className="font-medium text-sm">{alert.title}</div>
            <div className="mt-1 text-xs opacity-90">{alert.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
