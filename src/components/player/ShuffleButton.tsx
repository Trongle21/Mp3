"use client";

import { Shuffle } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { cn } from "@/lib/utils";

export function ShuffleButton({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { shuffle, toggleShuffle } = usePlayer();
  return (
    <button
      onClick={toggleShuffle}
      aria-label="Toggle shuffle"
      aria-pressed={shuffle}
      className={cn(shuffle ? "text-accent" : "text-text-secondary hover:text-text-primary")}
    >
      <Shuffle className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
    </button>
  );
}
