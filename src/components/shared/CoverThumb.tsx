"use client";

import Image from "next/image";

interface CoverThumbProps {
  /**
   * Direct public URL to the cover art. When falsy the gradient placeholder
   * is shown instead.
   */
  src?: string | null;
  /** Display title used for the alt text and the placeholder glyph. */
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
 * - With `src`: renders a next/image from the direct R2 public URL.
 * - Without `src`: renders the first letter of `title` on a gradient background.
 */
export function CoverThumb({
  src,
  title,
  size = 40,
  className = "rounded",
  fill = false,
}: CoverThumbProps) {
  if (!src) {
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
          {title ? title.trim()[0]?.toUpperCase() ?? "?" : "?"}
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={title ?? ""}
        fill
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={title ?? ""}
      width={size}
      height={size}
      className={className}
    />
  );
}