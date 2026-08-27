"use client";

import Image from "next/image";
import { coverInitial, coverUrl } from "@/lib/utils";

interface CoverThumbProps {
  /** Storage key for the artwork. When present we render the image, otherwise a placeholder. */
  coverKey?: string | null;
  title?: string | null;
  /** Width and height of the square thumbnail in pixels. */
  size?: number;
  className?: string;
  /** When true, fills its parent (requires a sized container). */
  fill?: boolean;
}

/**
 * Square cover thumbnail with a first-letter placeholder fallback.
 *
 * - `fill=false` (default): renders an <Image> with explicit `width`/`height`.
 * - `fill=true`: renders an <Image fill> so the parent controls the size.
 */
export function CoverThumb({
  coverKey,
  title,
  size = 40,
  className = "rounded",
  fill = false,
}: CoverThumbProps) {
  if (!coverKey) {
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
    return (
      <Image
        src={coverUrl(coverKey)}
        alt={title ?? ""}
        fill
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={coverUrl(coverKey)}
      alt={title ?? ""}
      width={size}
      height={size}
      className={className}
    />
  );
}
