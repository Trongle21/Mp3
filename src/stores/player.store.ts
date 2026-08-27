import { create } from "zustand";
import * as playerApi from "@/lib/api-player";
import { fetchTrackStream } from "@/lib/api-tracks";
import type { PlayerState, RepeatMode } from "@/interfaces/player.interface";
import type { Track } from "@/interfaces/track.interface";

const SYNC_INTERVAL_MS = 5000;

interface PlayerStore {
  state: PlayerState;
  syncIntervalId: ReturnType<typeof setInterval> | null;
  loadingTrackId: string | null;
  lastSyncedPosition: number;

  init: () => Promise<void>;

  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  seek: (positionSec: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;

  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;

  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  reorderQueue: (from: number, to: number) => void;

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

// Single shared audio element. Browser will issue Range requests on seek, so we
// do NOT preload the whole file as a blob for the initial playback path -- we
// stream it directly via the element's `src` while the auth header is attached
// by the axios interceptor inside fetchTrackStream (which falls back to a blob
// when needed).
let audioEl: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
// Smooth playhead subscribers (SeekBar). Updated at requestAnimationFrame
// cadence without triggering React re-renders of the whole player tree.
type PlayheadListener = (currentTime: number, duration: number) => void;
const playheadListeners = new Set<PlayheadListener>();
let rafId: number | null = null;
let lastDispatchedTime = -1;

function getAudioElement(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("Audio element requires window");
  }
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "metadata";
  }
  return audioEl;
}

function revokeCurrentObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function emitPlayhead() {
  if (!audioEl) return;
  const t = audioEl.currentTime || 0;
  const d = audioEl.duration || 0;
  // Only notify if time actually advanced by >= 1 frame worth to avoid spam.
  if (Math.abs(t - lastDispatchedTime) < 0.016 && playheadListeners.size <= 1) return;
  lastDispatchedTime = t;
  playheadListeners.forEach((fn) => fn(t, d));
}

function startRafLoop() {
  if (rafId !== null) return;
  const tick = () => {
    if (audioEl && !audioEl.paused) {
      emitPlayhead();
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  };
  rafId = requestAnimationFrame(tick);
}

function stopRafLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function subscribePlayhead(fn: PlayheadListener): () => void {
  playheadListeners.add(fn);
  if (audioEl && !audioEl.paused) startRafLoop();
  return () => {
    playheadListeners.delete(fn);
    if (playheadListeners.size === 0) stopRafLoop();
  };
}

export function getCurrentPositionSec(): number {
  return audioEl?.currentTime ?? 0;
}

async function loadAndPlay(track: Track, startAt: number) {
  const audio = getAudioElement();
  audio.pause();

  // Fetch the audio as a Blob so the Authorization header is carried by the
  // axios interceptor (and the 401 -> refresh -> retry flow applies). We then
  // hand the blob to an <audio> element via an object URL.
  revokeCurrentObjectUrl();
  const blob = await fetchTrackStream(track._id);
  currentObjectUrl = URL.createObjectURL(blob);
  audio.src = currentObjectUrl;

  audio.currentTime = startAt;
  try {
    await audio.play();
  } catch (err) {
    console.error("Playback failed:", err);
  }
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  state: emptyState,
  syncIntervalId: null,
  loadingTrackId: null,
  lastSyncedPosition: -1,

  init: async () => {
    try {
      const { data } = await playerApi.getPlayerState();
      set({ state: data.data });
    } catch {
      // No saved state yet (or not authenticated) -- fall back to empty state.
    }
  },

  play: (track) => {
    const { state } = get();
    const targetTrack = track ?? state.currentTrack;
    if (!targetTrack) return;

    const isNewTrack = track && track._id !== state.currentTrack?._id;
    set({ loadingTrackId: targetTrack._id });

    const apply = (startAt: number) => {
      set({
        loadingTrackId: null,
        state: {
          ...state,
          currentTrack: targetTrack,
          isPlaying: true,
          positionSec: startAt,
        },
      });
      get().saveState({ currentTrack: targetTrack, isPlaying: true, positionSec: startAt });
      startRafLoop();
    };

    if (isNewTrack) {
      loadAndPlay(targetTrack, 0).then(() => apply(0));
    } else if (audioEl && !audioEl.paused) {
      apply(audioEl.currentTime || 0);
    } else if (audioEl && audioEl.src) {
      audioEl
        .play()
        .then(() => apply(audioEl!.currentTime || 0))
        .catch((err) => {
          console.error("Resume failed:", err);
          set({ loadingTrackId: null });
        });
    } else {
      loadAndPlay(targetTrack, 0).then(() => apply(0));
    }

    if (!get().syncIntervalId) {
      const id = setInterval(() => {
        const current = get();
        if (current.state.isPlaying && audioEl) {
          get().saveState({ positionSec: audioEl.currentTime || 0 });
        }
      }, SYNC_INTERVAL_MS);
      set({ syncIntervalId: id });
    }
  },

  pause: () => {
    audioEl?.pause();
    stopRafLoop();
    set((s) => ({ state: { ...s.state, isPlaying: false } }));
    get().saveState({ isPlaying: false });
  },

  toggle: () => {
    const { state } = get();
    if (state.isPlaying) get().pause();
    else get().play();
  },

  seek: (positionSec) => {
    if (audioEl) {
      audioEl.currentTime = positionSec;
    }
    set((s) => ({ state: { ...s.state, positionSec } }));
    get().saveState({ positionSec });
  },

  setVolume: (volume) => {
    if (audioEl) {
      audioEl.volume = Math.min(1, Math.max(0, volume));
    }
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
    const currentPos = audioEl?.currentTime ?? 0;
    if (currentPos > 3) {
      get().seek(0);
      return;
    }
    const { state } = get();
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
