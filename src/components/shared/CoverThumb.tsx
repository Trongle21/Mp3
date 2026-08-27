"use client";

import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { coverInitial } from "@/lib/utils";

interface CoverThumbProps {
  /**
   * Track ID — the cover is fetched via the authenticated `/tracks/:id/cover`
   * endpoint and rendered as a blob URL.
   */
  trackId?: string | null;
  /** Display title used for the placeholder glyph and alt text. */
  title?: string | null;
  /** Width and height of the square thumbnail in pixels. */
  size?: number;
  className?: string;
  /** When true, fills the parent container (requires a sized container). */
  fill?: boolean;
}

/**
 * Square cover thumbnail.
 *
 * - With `trackId`: fetches the artwork through the authenticated endpoint.
 * - Without `trackId` or on fetch failure: renders the first letter of `title`
 *   on a gradient background.
 *
 * Uses a plain `<img>` (not next/image) because the source is an in-memory
 * blob URL created by `URL.createObjectURL`, which next/image cannot optimize.
 */
export function CoverThumb({
  trackId,
  title,
  size = 40,
  className = "rounded",
  fill = false,
}: CoverThumbProps) {
  const endpoint = trackId ? `/tracks/${trackId}/cover` : null;
  const url = useAuthenticatedImage(endpoint);

  if (!url) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-bg-highlight to-bg-elevated ${className}`}
        style={fill ? undefined : { width: size, height: size }}
        aria-hidden
      >
        <span
          className="font-semibold text-text-secondary"
          style={
            fill
              ? undefined
              : { fontSize: Math.max(12, Math.round(size * 0.4)) }
          }
        >
          {coverInitial(title)}
        </span>
      </div>
    );
  }

  if (fill) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={title ?? ""}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={title ?? ""}
      className={`shrink-0 object-cover ${className}`}
      width={size}
      height={size}
    />
  );
}