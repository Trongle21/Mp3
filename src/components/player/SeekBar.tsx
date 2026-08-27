"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/utils";
import { subscribePlayhead } from "@/stores/player.store";

interface SeekBarProps {
  positionSec: number;
  durationSec: number;
  onSeek: (value: number) => void;
}

export function SeekBar({ positionSec, durationSec, onSeek }: SeekBarProps) {
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  const [livePosition, setLivePosition] = useState(positionSec);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to the smooth playhead stream (rAF-driven) so the bar advances
  // every frame instead of once per second.
  useEffect(() => {
    let pending = false;
    const unsubscribe = subscribePlayhead((t) => {
      if (scrubValue !== null) return;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (scrubValue !== null) return;
        setLivePosition(t);
      });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrubValue]);

  const displayValue = scrubValue ?? livePosition;
  const max = Math.max(durationSec, 1);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={max}
        step={0.1}
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