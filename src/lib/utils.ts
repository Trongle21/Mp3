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

/**
 * First non-whitespace character of a track/group title, uppercased.
 * Falls back to "?" for empty / non-string input.
 * Used as the placeholder glyph when no cover artwork is available.
 */
export function coverInitial(title: string | null | undefined): string {
  if (!title) return "?";
  const trimmed = title.trim();
  if (!trimmed) return "?";
  // Code-point aware so combining marks / surrogate pairs aren't split.
  const first = Array.from(trimmed)[0] ?? "";
  return first.toUpperCase() || "?";
}
