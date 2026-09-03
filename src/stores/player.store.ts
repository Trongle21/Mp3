import { playerApi, trackApi } from '@/api';
import type { IPlayerState, RepeatMode } from '@/interfaces/player.interface';
import type { ITrack } from '@/interfaces/track.interface';
import { create } from 'zustand';

const SYNC_INTERVAL_MS = 5000;

interface PlayerStore {
  state: IPlayerState;
  syncIntervalId: ReturnType<typeof setInterval> | null;
  loadingTrackId: string | null;
  lastSyncedPosition: number;
  pendingResume: { track: ITrack; positionSec: number } | null;

  // Exposed audio element for visualizer
  getAudioElement: () => HTMLAudioElement;

  init: () => Promise<void>;
  acceptResume: () => Promise<void>;
  dismissResume: () => void;

  play: (track?: ITrack) => void;
  pause: () => void;
  toggle: () => void;
  seek: (positionSec: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;

  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;

  setQueue: (tracks: ITrack[]) => void;
  addToQueue: (track: ITrack) => void;
  reorderQueue: (from: number, to: number) => void;

  saveState: (partial?: Partial<IPlayerState>) => Promise<void>;
}

const emptyState: IPlayerState = {
  user: '',
  currentTrack: null,
  positionSec: 0,
  isPlaying: false,
  repeatMode: 'off',
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
let onEndedCallback: (() => void) | null = null;

function getAudioElement(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    throw new Error('Audio element requires window');
  }
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'metadata';
    audioEl.addEventListener('ended', () => {
      onEndedCallback?.();
    });
  }
  return audioEl;
}

export function setOnEndedCallback(fn: (() => void) | null) {
  onEndedCallback = fn;
}

function revokeCurrentObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function emitPlayhead() {
  if (!audioEl) {
    return;
  }
  const t = audioEl.currentTime || 0;
  const d = audioEl.duration || 0;
  // Only notify if time actually advanced by >= 1 frame worth to avoid spam.
  if (Math.abs(t - lastDispatchedTime) < 0.016 && playheadListeners.size <= 1) {
    return;
  }
  lastDispatchedTime = t;
  playheadListeners.forEach(fn => fn(t, d));
}

function startRafLoop() {
  if (rafId !== null) {
    return;
  }
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
  if (audioEl && !audioEl.paused) {
    startRafLoop();
  }
  return () => {
    playheadListeners.delete(fn);
    if (playheadListeners.size === 0) {
      stopRafLoop();
    }
  };
}

export function getCurrentPositionSec(): number {
  return audioEl?.currentTime ?? 0;
}

// -----------------------------------------------------------------------------
// Local persistence (so F5 / route changes don't lose the playhead).
// -----------------------------------------------------------------------------
const LS_KEY = 'player.lastSession.v1';
const LS_WRITE_THROTTLE_MS = 1500;
let lsWriteTimer: ReturnType<typeof setTimeout> | null = null;
let lsDirtyPosition = 0;

interface PersistedSession {
  track: ITrack;
  positionSec: number;
  updatedAt: string;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function persistSessionThrottled(track: ITrack, positionSec: number) {
  if (!isBrowser()) {
    return;
  }
  lsDirtyPosition = positionSec;
  if (lsWriteTimer) {
    return;
  }
  lsWriteTimer = setTimeout(() => {
    lsWriteTimer = null;
    const pos = lsDirtyPosition;
    lsDirtyPosition = 0;
    const payload: PersistedSession = {
      track,
      positionSec: pos,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {
      // Quota or private mode -- non-fatal.
    }
  }, LS_WRITE_THROTTLE_MS);
}

function readPersistedSession(): PersistedSession | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed?.track?._id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function loadAndPlay(track: ITrack, startAt: number, autoPlay = true) {
  const audio = getAudioElement();
  audio.pause();

  // Fetch the audio as a Blob so the Authorization header is carried by the
  // axios interceptor (and the 401 -> refresh -> retry flow applies). We then
  // hand the blob to an <audio> element via an object URL.
  revokeCurrentObjectUrl();
  const blob = await trackApi.fetchStream(track._id);
  currentObjectUrl = URL.createObjectURL(blob);
  audio.src = currentObjectUrl;

  audio.currentTime = startAt;
  if (!autoPlay) {
    return;
  }
  try {
    await audio.play();
  } catch (err) {
    console.error('Playback failed:', err);
  }
}

async function preloadOnly(track: ITrack, startAt: number) {
  await loadAndPlay(track, startAt, false);
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  state: emptyState,
  syncIntervalId: null,
  loadingTrackId: null,
  lastSyncedPosition: -1,
  pendingResume: null,

  getAudioElement: () => getAudioElement(),

  init: async () => {
    // 1. Pull the local cache first so the UI has something to show instantly.
    const cached = readPersistedSession();
    if (cached) {
      set({
        state: {
          ...emptyState,
          currentTrack: cached.track,
          positionSec: cached.positionSec,
        },
      });
    }

    // 2. Pull the authoritative state from the backend.
    let backendState: IPlayerState | null = null;
    try {
      const { data } = await playerApi.getState();
      backendState = data.data;
      if (backendState) {
        // Merge coverUrl from cached track if backend doesn't have it
        if (
          backendState.currentTrack &&
          cached?.track &&
          !backendState.currentTrack.coverUrl
        ) {
          backendState.currentTrack.coverUrl = cached.track.coverUrl;
        }
        // Also merge for queue items
        if (cached?.track && backendState.queue) {
          backendState.queue = backendState.queue.map(t =>
            t._id === cached.track._id && !t.coverUrl && cached.track.coverUrl
              ? { ...t, coverUrl: cached.track.coverUrl }
              : t
          );
        }
        set({ state: backendState });
      }
    } catch {
      // Stay with the cached (or empty) state.
    }

    // 3. If there is something to resume, preload the audio silently and surface
    // a Resume button so the user decides when playback actually starts.
    const targetTrack = backendState?.currentTrack ?? cached?.track ?? null;
    const targetPosition =
      backendState?.currentTrack && backendState.positionSec > 0
        ? backendState.positionSec
        : (cached?.positionSec ?? 0);

    if (targetTrack && targetPosition > 0) {
      const resume = { track: targetTrack, positionSec: targetPosition };
      set({ pendingResume: resume });
      try {
        await preloadOnly(targetTrack, targetPosition);
      } catch (err) {
        console.error('Preload on init failed:', err);
        set({ pendingResume: null });
      }
    } else if (targetTrack) {
      // No saved position worth resuming -- still surface a "Resume" so the
      // track can be played without an extra click.
      set({ pendingResume: { track: targetTrack, positionSec: 0 } });
    }
  },

  acceptResume: async () => {
    const resume = get().pendingResume;
    if (!resume) {
      return;
    }
    const { track, positionSec } = resume;
    set({
      pendingResume: null,
      state: {
        ...get().state,
        currentTrack: track,
        positionSec,
        isPlaying: true,
      },
      loadingTrackId: track._id,
    });
    try {
      if (audioEl && audioEl.src) {
        audioEl.currentTime = positionSec;
        await audioEl.play();
      } else {
        await loadAndPlay(track, positionSec, true);
      }
    } catch (err) {
      console.error('Resume playback failed:', err);
    } finally {
      set({ loadingTrackId: null });
      startRafLoop();
      get().saveState({ currentTrack: track, isPlaying: true, positionSec });
      persistSessionThrottled(track, positionSec);
    }
  },

  dismissResume: () => {
    set({ pendingResume: null });
  },

  play: track => {
    const { state } = get();
    let targetTrack = track ?? state.currentTrack;
    if (!targetTrack) {
      return;
    }

    // Preserve coverUrl from current track if new track doesn't have one
    if (track && !track.coverUrl && state.currentTrack?.coverUrl) {
      targetTrack = { ...track, coverUrl: state.currentTrack.coverUrl };
    }

    // User explicitly clicked play -> no longer needs a Resume prompt.
    if (get().pendingResume?.track._id === targetTrack._id) {
      set({ pendingResume: null });
    }

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
      get().saveState({
        currentTrack: targetTrack,
        isPlaying: true,
        positionSec: startAt,
      });
      persistSessionThrottled(targetTrack, startAt);
      startRafLoop();
    };

    if (isNewTrack) {
      // Set up ended callback for repeat functionality
      setOnEndedCallback(() => {
        const { state } = get();
        if (state.repeatMode === 'one' && state.currentTrack) {
          // Repeat current track: seek to 0 and play again
          const audio = getAudioElement();
          audio.currentTime = 0;
          audio.play().catch(console.error);
        } else {
          // Next track or repeat all
          get().next();
        }
      });
      loadAndPlay(targetTrack, 0).then(() => apply(0));
    } else if (audioEl && !audioEl.paused) {
      apply(audioEl.currentTime || 0);
    } else if (audioEl && audioEl.src) {
      audioEl
        .play()
        .then(() => apply(audioEl!.currentTime || 0))
        .catch(err => {
          console.error('Resume failed:', err);
          set({ loadingTrackId: null });
        });
    } else {
      loadAndPlay(targetTrack, 0).then(() => apply(0));
    }

    if (!get().syncIntervalId) {
      const id = setInterval(() => {
        const current = get();
        if (current.state.isPlaying && audioEl) {
          const pos = audioEl.currentTime || 0;
          get().saveState({ positionSec: pos });
          if (current.state.currentTrack) {
            persistSessionThrottled(current.state.currentTrack, pos);
          }
        }
      }, SYNC_INTERVAL_MS);
      set({ syncIntervalId: id });
    }
  },

  pause: () => {
    audioEl?.pause();
    stopRafLoop();
    const { state } = get();
    set({ state: { ...state, isPlaying: false } });
    get().saveState({ isPlaying: false });
    if (state.currentTrack) {
      const pos = audioEl?.currentTime ?? state.positionSec;
      persistSessionThrottled(state.currentTrack, pos);
    }
  },

  toggle: () => {
    const { state } = get();
    if (state.isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  seek: positionSec => {
    if (audioEl) {
      audioEl.currentTime = positionSec;
    }
    set(s => ({ state: { ...s.state, positionSec } }));
    get().saveState({ positionSec });
    const currentTrack = get().state.currentTrack;
    if (currentTrack) {
      persistSessionThrottled(currentTrack, positionSec);
    }
  },

  setVolume: volume => {
    if (audioEl) {
      audioEl.volume = Math.min(1, Math.max(0, volume));
    }
  },

  next: () => {
    const { state } = get();
    if (state.queue.length === 0) {
      return;
    }
    const currentIndex = state.queue.findIndex(
      t => t._id === state.currentTrack?._id
    );
    let nextIndex = currentIndex + 1;

    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        nextIndex = 0;
      } // restart from beginning when at end
    }

    const nextTrack = state.queue[nextIndex];
    // Merge coverUrl from current track if the next track doesn't have one
    if (nextTrack && !nextTrack.coverUrl && state.currentTrack?.coverUrl) {
      get().play({ ...nextTrack, coverUrl: state.currentTrack.coverUrl });
    } else {
      get().play(nextTrack);
    }
  },

  previous: () => {
    const currentPos = audioEl?.currentTime ?? 0;
    if (currentPos > 3) {
      get().seek(0);
      return;
    }
    const { state } = get();
    const currentIndex = state.queue.findIndex(
      t => t._id === state.currentTrack?._id
    );
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = state.queue[prevIndex];
      // Merge coverUrl from current track if the previous track doesn't have one
      if (!prevTrack.coverUrl && state.currentTrack?.coverUrl) {
        get().play({ ...prevTrack, coverUrl: state.currentTrack.coverUrl });
      } else {
        get().play(prevTrack);
      }
    } else {
      get().seek(0);
    }
  },

  setRepeatMode: mode => {
    set(s => ({ state: { ...s.state, repeatMode: mode } }));
    get().saveState({ repeatMode: mode });
  },

  toggleShuffle: () => {
    const shuffle = !get().state.shuffle;
    set(s => ({ state: { ...s.state, shuffle } }));
    get().saveState({ shuffle });
  },

  setQueue: tracks => {
    set(s => ({ state: { ...s.state, queue: tracks } }));
    get().saveState({ queue: tracks });
  },

  addToQueue: track => {
    const queue = [...get().state.queue, track];
    set(s => ({ state: { ...s.state, queue } }));
    get().saveState({ queue });
  },

  reorderQueue: (from, to) => {
    const queue = [...get().state.queue];
    const [moved] = queue.splice(from, 1);
    queue.splice(to, 0, moved);
    set(s => ({ state: { ...s.state, queue } }));
    get().saveState({ queue });
  },

  saveState: async partial => {
    try {
      await playerApi.updateState(partial ?? {});
    } catch {
      // Non-fatal: playback continues locally even if the sync call fails.
    }
  },
}));
