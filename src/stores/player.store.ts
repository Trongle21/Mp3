import { create } from "zustand";
import { Howl } from "howler";
import * as playerApi from "@/lib/api-player";
import { streamTrackUrl } from "@/lib/api-tracks";
import type { PlayerState, RepeatMode } from "@/interfaces/player.interface";
import type { Track } from "@/interfaces/track.interface";

const SYNC_INTERVAL_MS = 5000;

interface PlayerStore {
  state: PlayerState;
  howl: Howl | null;
  syncIntervalId: ReturnType<typeof setInterval> | null;

  // Lifecycle
  init: () => Promise<void>;

  // Playback controls
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  seek: (positionSec: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;

  // Modes
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;

  // Queue
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  reorderQueue: (from: number, to: number) => void;

  // Backend sync
  saveState: (partial?: Partial<PlayerState>) => Promise<void>;
}

const emptyState: PlayerState = {
  user: "",
  currentTrack: null,
  positionSec: 0,
  isPlaying: false,
  repeatMode: "off",
  shuffle: false,
  queue: [],
  updatedAt: new Date().toISOString(),
};

function loadTrack(track: Track, onEnd: () => void): Howl {
  return new Howl({
    src: [streamTrackUrl(track._id)],
    html5: true, // required so the browser issues Range requests for streaming
    onend: onEnd,
  });
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  state: emptyState,
  howl: null,
  syncIntervalId: null,

  init: async () => {
    try {
      const { data } = await playerApi.getPlayerState();
      set({ state: data.data });
    } catch {
      // No saved state yet (or not authenticated) — fall back to empty state.
    }
  },

  play: (track) => {
    const { state, howl } = get();
    const targetTrack = track ?? state.currentTrack;
    if (!targetTrack) return;

    const isNewTrack = track && track._id !== state.currentTrack?._id;

    if (isNewTrack || !howl) {
      howl?.unload();
      const newHowl = loadTrack(targetTrack, () => get().next());
      newHowl.play();
      set({
        howl: newHowl,
        state: { ...state, currentTrack: targetTrack, isPlaying: true, positionSec: 0 },
      });
    } else {
      howl.play();
      set({ state: { ...state, isPlaying: true } });
    }

    if (!get().syncIntervalId) {
      const id = setInterval(() => {
        const current = get();
        if (current.state.isPlaying && current.howl) {
          const pos = Math.floor(current.howl.seek() as number) || 0;
          get().saveState({ positionSec: pos });
        }
      }, SYNC_INTERVAL_MS);
      set({ syncIntervalId: id });
    }

    get().saveState({ currentTrack: targetTrack, isPlaying: true });
  },

  pause: () => {
    const { howl, state } = get();
    howl?.pause();
    set({ state: { ...state, isPlaying: false } });
    get().saveState({ isPlaying: false });
  },

  toggle: () => {
    get().state.isPlaying ? get().pause() : get().play();
  },

  seek: (positionSec) => {
    const { howl, state } = get();
    howl?.seek(positionSec);
    set({ state: { ...state, positionSec } });
    get().saveState({ positionSec });
  },

  setVolume: (volume) => {
    get().howl?.volume(Math.min(1, Math.max(0, volume)));
  },

  next: () => {
    const { state } = get();
    if (state.queue.length === 0) return;
    const currentIndex = state.queue.findIndex((t) => t._id === state.currentTrack?._id);
    let nextIndex = currentIndex + 1;

    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      if (state.repeatMode === "all") nextIndex = 0;
      else return;
    }

    get().play(state.queue[nextIndex]);
  },

  previous: () => {
    const { state, howl } = get();
    // If more than 3s into the track, restart it instead of going back.
    const currentPos = (howl?.seek() as number) || 0;
    if (currentPos > 3) {
      get().seek(0);
      return;
    }
    const currentIndex = state.queue.findIndex((t) => t._id === state.currentTrack?._id);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) get().play(state.queue[prevIndex]);
    else get().seek(0);
  },

  setRepeatMode: (mode) => {
    set((s) => ({ state: { ...s.state, repeatMode: mode } }));
    get().saveState({ repeatMode: mode });
  },

  toggleShuffle: () => {
    const shuffle = !get().state.shuffle;
    set((s) => ({ state: { ...s.state, shuffle } }));
    get().saveState({ shuffle });
  },

  setQueue: (tracks) => {
    set((s) => ({ state: { ...s.state, queue: tracks } }));
    get().saveState({ queue: tracks });
  },

  addToQueue: (track) => {
    const queue = [...get().state.queue, track];
    set((s) => ({ state: { ...s.state, queue } }));
    get().saveState({ queue });
  },

  reorderQueue: (from, to) => {
    const queue = [...get().state.queue];
    const [moved] = queue.splice(from, 1);
    queue.splice(to, 0, moved);
    set((s) => ({ state: { ...s.state, queue } }));
    get().saveState({ queue });
  },

  saveState: async (partial) => {
    try {
      await playerApi.updatePlayerState(partial ?? {});
    } catch {
      // Non-fatal: playback continues locally even if the sync call fails.
    }
  },
}));
