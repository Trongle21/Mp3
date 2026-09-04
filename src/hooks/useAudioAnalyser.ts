'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';

// Module-level singleton audio graph.
// One AudioContext + Analyser + Source across the app's lifetime — so we never
// re-create the graph on re-render and never hit InvalidStateError from calling
// createMediaElementSource twice on the same <audio>.
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;
let connectedAudio: HTMLAudioElement | null = null;
const listeners = new Set<(ready: boolean) => void>();

function getCtx(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new Ctor();
  }
  return audioContext;
}

function notify(ready: boolean) {
  listeners.forEach(l => l(ready));
}

// Resume must be called as close as possible to the native 'play'/'playing'
// event (i.e. still inside the user-gesture stack) — browsers like Safari
// silently ignore resume() calls that happen "too late" via a React effect.
function resumeCtx() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      /* will retry on the next play/playing event */
    });
  }
}

// Wires (or re-wires) the Web Audio graph for a given <audio> element.
// Idempotent — safe to call repeatedly; no-ops once the element is already
// connected.
function ensureGraph(audio: HTMLAudioElement): boolean {
  // Must be set before the browser starts fetching the resource to actually
  // take effect. Best-effort guard for elements whose src is assigned later
  // in the same tick.
  if (!audio.crossOrigin) {
    audio.crossOrigin = 'anonymous';
  }

  const ctx = getCtx();

  if (!analyser) {
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.4;
  }

  // Same <audio> already wired — nothing to do.
  if (source && connectedAudio === audio) {
    return true;
  }

  // Different <audio> than before — tear down old source.
  if (source && connectedAudio !== audio) {
    try {
      source.disconnect();
    } catch {
      /* noop */
    }
    source = null;
  }

  if (!source) {
    try {
      source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      connectedAudio = audio;
    } catch (err) {
      console.error('useAudioAnalyser: cannot create source', err);
      return false;
    }
  }

  notify(true);
  return true;
}

export function useAudioAnalyser() {
  const getAudioElement = usePlayerStore(s => s.getAudioElement);
  const isPlaying = usePlayerStore(s => s.state.isPlaying);
  const [ready, setReady] = useState(false);
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(0));

  // Subscribe to graph-ready notifications.
  useEffect(() => {
    const l = (r: boolean) => setReady(r);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  // Wire the graph exactly when the <audio> element starts playing.
  // We hook the native 'play' event instead of only reacting to the store's
  // isPlaying flag: it fires at the precise moment playback begins (and
  // still inside the user-gesture call stack), which is what makes
  // ctx.resume() reliable, and it can't drift out of sync with the store.
  useEffect(() => {
    const audio = getAudioElement();
    if (!audio) {
      return;
    }

    const wire = () => {
      if (ensureGraph(audio) && analyser) {
        if (frequencyDataRef.current.length !== analyser.frequencyBinCount) {
          frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        resumeCtx();
      }
    };

    // Visualizer mounted after playback had already started (hot reload,
    // route change, etc.) — wire immediately instead of waiting for the
    // next 'play' event that may never come.
    if (!audio.paused) {
      wire();
    }

    audio.addEventListener('play', wire);
    audio.addEventListener('playing', resumeCtx);

    return () => {
      audio.removeEventListener('play', wire);
      audio.removeEventListener('playing', resumeCtx);
    };
  }, [getAudioElement]);

  // Belt-and-suspenders: also try resuming whenever the store's isPlaying
  // flips true, in case it can become true without a fresh native event.
  useEffect(() => {
    if (isPlaying) {
      resumeCtx();
    }
  }, [isPlaying]);

  return {
    analyser,
    ensureGraph,
    frequencyDataRef,
    getAudioElement,
    isPlaying,
    ready,
  };
}
