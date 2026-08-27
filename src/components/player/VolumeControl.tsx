"use client";

import { useState, useEffect } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "@/stores/player.store";

export function VolumeControl() {
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

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        aria-label="Mute"
        className="text-text-secondary hover:text-text-primary"
      >
        <Icon className="h-4 w-4" />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="h-1 w-24 cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, #a0a0a0 ${volume * 100}%, #282828 ${volume * 100}%)`,
        }}
        aria-label="Volume"
      />
    </div>
  );
}
