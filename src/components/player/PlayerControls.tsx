"use client";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";

export function PlayerControls({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { isPlaying, toggle, next, previous } = usePlayer();

  const skipSize = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const playButtonSize = size === "lg" ? "h-14 w-14" : "h-8 w-8";
  const playIconSize = size === "lg" ? "h-6 w-6" : "h-4 w-4";

  return (
    <div className={cn("flex items-center", size === "lg" ? "gap-8" : "gap-5")}>
      <button onClick={previous} aria-label="Previous" className="text-text-primary hover:text-accent">
        <SkipBack className={skipSize} />
      </button>
      <button
        onClick={toggle}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={cn(
          "flex items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105",
          playButtonSize
        )}
      >
        {isPlaying ? (
          <Pause className={playIconSize} />
        ) : (
          <Play className={cn(playIconSize, size === "lg" ? "ml-1" : "ml-0.5")} />
        )}
      </button>
      <button onClick={next} aria-label="Next" className="text-text-primary hover:text-accent">
        <SkipForward className={skipSize} />
      </button>
    </div>
  );
}
