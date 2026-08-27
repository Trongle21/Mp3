"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Play, Heart } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { coverUrl } from "@/lib/utils";
import { SeekBar } from "@/components/player/SeekBar";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ShuffleButton } from "@/components/player/ShuffleButton";
import { RepeatModeButton } from "@/components/player/RepeatModeButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useState } from "react";

export default function NowPlayingPage() {
  const { currentTrack, positionSec, seek } = usePlayer();
  const [liked, setLiked] = useState(false);

  if (!currentTrack) {
    return (
      <div className="pt-24">
        <EmptyState
          icon={Play}
          title="Nothing playing"
          description="Pick a track from your library to start listening."
        />
      </div>
    );
  }

  const bgUrl = currentTrack.coverKey ? coverUrl(currentTrack.coverKey) : null;

  return (
    <div className="relative -mx-8 -mt-4 flex min-h-[calc(100vh-90px)] flex-col overflow-hidden pb-12">
      {bgUrl && (
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-3xl"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-bg-primary/60" />

      <div className="relative z-10 flex items-center px-8 py-4">
        <Link
          href="/library"
          aria-label="Back"
          className="text-text-secondary hover:text-text-primary"
        >
          <ChevronDown className="h-6 w-6" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-8">
        <div className="h-[min(45vh,500px)] w-[min(45vh,500px)] shrink-0 overflow-hidden rounded-lg shadow-2xl">
          {bgUrl ? (
            <Image
              src={bgUrl}
              alt={currentTrack.title}
              width={500}
              height={500}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-highlight text-text-muted">
              No cover
            </div>
          )}
        </div>

        <div className="mt-8 flex w-full items-start justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-h1 text-text-primary">
              {currentTrack.title}
            </h1>
            <p className="mt-1 truncate text-body text-text-secondary">
              {currentTrack.artist}{" "}
              {currentTrack.album ? `· ${currentTrack.album}` : ""}
            </p>
          </div>
          <button
            onClick={() => setLiked((v) => !v)}
            aria-label={liked ? "Unlike" : "Like"}
            className="ml-4 shrink-0 text-text-secondary hover:text-accent"
          >
            <Heart
              className={liked ? "h-6 w-6 fill-accent text-accent" : "h-6 w-6"}
            />
          </button>
        </div>

        <div className="mt-6 w-full">
          <SeekBar
            positionSec={positionSec}
            durationSec={currentTrack.durationSec}
            onSeek={seek}
          />
        </div>

        <div className="mt-6 flex items-center gap-8">
          <ShuffleButton size="lg" />
          <PlayerControls size="lg" />
          <RepeatModeButton size="lg" />
        </div>
      </div>
    </div>
  );
}
