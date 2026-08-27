import type { Track } from "./track.interface";

export type RepeatMode = "off" | "one" | "all";

export interface PlayerState {
  user: string;
  currentTrack: Track | null;
  positionSec: number;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  queue: Track[];
  updatedAt: string;
}

export interface PlayerStateUpdate {
  currentTrack?: Track | null;
  positionSec?: number;
  isPlaying?: boolean;
  queue?: Track[];
  repeatMode?: RepeatMode;
  shuffle?: boolean;
}
