"use client";

import { Repeat, Repeat1 } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";
import type { RepeatMode } from "@/interfaces/player.interface";

const ORDER: RepeatMode[] = ["off", "one", "all"];

export function RepeatModeButton({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { repeatMode, setRepeatMode } = usePlayer();
  const Icon = repeatMode === "one" ? Repeat1 : Repeat;

  const cycle = () => {
    setRepeatMode(ORDER[(ORDER.indexOf(repeatMode) + 1) % ORDER.length]);
  };

  return (
    <button
      onClick={cycle}
      aria-label={`Repeat mode: ${repeatMode}. Click to change.`}
      className={cn(repeatMode !== "off" ? "text-accent" : "text-text-secondary hover:text-text-primary")}
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
    </button>
  );
}
