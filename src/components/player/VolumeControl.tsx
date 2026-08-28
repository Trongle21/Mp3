"use client";

import { useState, useEffect } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/stores/player.store";

interface VolumeControlProps {
  size?: "sm" | "lg";
  showLabel?: boolean;
}

export function VolumeControl({ size = "sm", showLabel = false }: VolumeControlProps) {
  const setVolume = usePlayerStore((s) => s.setVolume);
  const [volume, setLocalVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);

  useEffect(() => {
    const audio = document.querySelector("audio");
    if (audio) setLocalVolume(audio.volume);
  }, []);

  const handleChange = (value: number) => {
    setLocalVolume(value);
    setVolume(value);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      handleChange(0);
    } else {
      handleChange(prevVolume || 0.7);
    }
  };

  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const isLarge = size === "lg";
  const iconClass = isLarge ? "h-5 w-5" : "h-4 w-4";
  const sliderClass = isLarge ? "w-32 md:w-40" : "w-24";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        aria-label={volume === 0 ? "Unmute" : "Mute"}
        className="text-text-secondary hover:text-text-primary"
      >
        <Icon className={iconClass} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => handleChange(Number(e.target.value))}
        className={`volume-slider h-1 ${sliderClass} cursor-pointer appearance-none rounded-full`}
        style={
          {
            "--volume-fill": `${volume * 100}%`,
          } as React.CSSProperties
        }
        aria-label="Volume"
      />
      {showLabel && (
        <span className="min-w-[3ch] text-caption tabular-nums text-text-muted">
          {Math.round(volume * 100)}
        </span>
      )}
    </div>
  );
}