"use client";

import { AudioVisualizer } from "@/components/player/AudioVisualizer";
import { PlayerControls } from "@/components/player/PlayerControls";
import { RepeatModeButton } from "@/components/player/RepeatModeButton";
import { SeekBar } from "@/components/player/SeekBar";
import { ShuffleButton } from "@/components/player/ShuffleButton";
import { VolumeControl } from "@/components/player/VolumeControl";
import { CoverThumb } from "@/components/shared/CoverThumb";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePlayer } from "@/hooks/usePlayer";
import { ChevronDown, Heart, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NowPlayingPage() {
  const { currentTrack, positionSec, seek, isPlaying } = usePlayer();
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

  const bgUrl = currentTrack.coverUrl || null;

  return (
    <div className="relative -mx-4 -mt-4 flex min-h-[calc(100vh-160px)] flex-col overflow-hidden pb-8 sm:-mx-6 sm:min-h-[calc(100vh-90px)] sm:pb-12 lg:-mx-8">
      {/* Blurred background */}
      {bgUrl && (
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-3xl"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-bg-primary/60" />

      <div className="relative z-10 flex items-center px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/library"
          aria-label="Back"
          className="text-text-secondary hover:text-text-primary"
        >
          <ChevronDown className="h-6 w-6" />
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 sm:px-8">
        {/* Spinning Disc with Glow */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full scale-105 opacity-50"
            style={{
              background: bgUrl
                ? `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
              filter: "blur(20px)",
              transform: "scale(1.1)",
            }}
          />

          {/* Spinning vinyl disc */}
          <div
            className={`relative h-[min(55vw,320px)] w-[min(55vw,320px)] shrink-0 sm:h-[min(45vh,500px)] sm:w-[min(45vh,500px)] ${isPlaying ? "animate-spin-slow" : ""}`}
            style={{ animationDuration: "20s" }}
          >
            {/* Vinyl base */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl">
              {/* Vinyl grooves */}
              <div className="absolute inset-4 rounded-full overflow-hidden opacity-20">
                <div className="absolute inset-0 rounded-full border border-gray-600" />
                <div className="absolute inset-2 rounded-full border border-gray-600" />
                <div className="absolute inset-[6px] rounded-full border border-gray-600" />
                <div className="absolute inset-[10px] rounded-full border border-gray-600" />
                <div className="absolute inset-[14px] rounded-full border border-gray-600" />
                <div className="absolute inset-[18px] rounded-full border border-gray-600" />
              </div>

              {/* Reflective highlight */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent" />

              {/* Center hole with cover */}
              <div className="absolute inset-[22%] rounded-full overflow-hidden shadow-inner ring-1 ring-white/10">
                <CoverThumb
                  src={currentTrack.coverUrl}
                  title={currentTrack.title}
                  className="!w-full !h-full"
                  fill
                />
              </div>

              {/* Center dot */}
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg" />
            </div>
          </div>

          {/* Pause indicator overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                <Play className="ml-1 h-6 w-6 fill-white text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Visualizer */}
        <div className="mt-6 h-16 w-full max-w-lg">
          <AudioVisualizer
            barCount={48}
            barColor="#1db954"
            mirror={true}
            className="h-full"
          />
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

        {/* Volume control */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <VolumeControl size="lg" showLabel />
        </div>
      </div>
    </div>
  );
}
