"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/utils";

interface SeekBarProps {
  positionSec: number;
  durationSec: number;
  onSeek: (value: number) => void;
}

export function SeekBar({ positionSec, durationSec, onSeek }: SeekBarProps) {
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  const displayValue = scrubValue ?? positionSec;
  const max = Math.max(durationSec, 1);

  return (
    <div className="w-full">
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={displayValue}
        onChange={(e) => setScrubValue(Number(e.target.value))}
        onMouseUp={(e) => {
          onSeek(Number((e.target as HTMLInputElement).value));
          setScrubValue(null);
        }}
        onTouchEnd={(e) => {
          onSeek(Number((e.target as HTMLInputElement).value));
          setScrubValue(null);
        }}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-highlight accent-accent"
        style={{
          background: `linear-gradient(to right, #1db954 ${(displayValue / max) * 100}%, #282828 ${
            (displayValue / max) * 100
          }%)`,
        }}
        aria-label="Seek"
      />
      <div className="mt-1 flex justify-between text-caption text-text-muted">
        <span>{formatDuration(displayValue)}</span>
        <span>{formatDuration(durationSec)}</span>
      </div>
    </div>
  );
}
