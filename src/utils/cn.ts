/**
 * `cn` — class-name merger that combines `clsx` for conditional concatenation
 * with `tailwind-merge` for resolving conflicting Tailwind utility classes.
 *
 * Use this helper anywhere multiple class strings (some conditional) need to
 * collapse into a single, conflict-free `className` value.
 */

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
