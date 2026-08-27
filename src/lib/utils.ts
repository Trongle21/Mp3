import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a duration in seconds as m:ss (e.g. 154 -> "2:34"). */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function coverUrl(coverKey: string): string {
  if (!coverKey) return "";
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  return `${base}/${coverKey}`;
}
