"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player.store";

export function useAudioAnalyser() {
  const getAudioElement = usePlayerStore((s) => s.getAudioElement);
  const isPlaying = usePlayerStore((s) => s.state.isPlaying);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(0));

  useEffect(() => {
    const setupAnalyser = () => {
      if (typeof window === "undefined") return;

      try {
        // Create AudioContext
        if (!audioContextRef.current) {
          audioContextRef.current = new (
            window.AudioContext ||
            (
              window as typeof window & {
                webkitAudioContext: typeof AudioContext;
              }
            ).webkitAudioContext
          )();
        }

        const audioContext = audioContextRef.current;

        // Resume context if suspended (autoplay policy)
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }

        // Create analyser node
        if (!analyserNodeRef.current) {
          analyserNodeRef.current = audioContext.createAnalyser();
          analyserNodeRef.current.fftSize = 256;
          analyserNodeRef.current.smoothingTimeConstant = 0.8;
        }

        const analyser = analyserNodeRef.current;

        // Create frequency data array
        const bufferLength = analyser.frequencyBinCount;
        frequencyDataRef.current = new Uint8Array(bufferLength);

        // Connect audio element to analyser
        const audio = getAudioElement();
        if (!audio.src) return;

        // Create source if not exists or source element changed
        if (
          !sourceNodeRef.current ||
          sourceNodeRef.current.mediaElement !== audio
        ) {
          // Disconnect old source
          if (sourceNodeRef.current) {
            try {
              sourceNodeRef.current.disconnect();
            } catch {
              // Ignore disconnect errors
            }
          }

          // Create new source
          try {
            sourceNodeRef.current =
              audioContext.createMediaElementSource(audio);
            sourceNodeRef.current.connect(analyser);
            analyser.connect(audioContext.destination);
          } catch {
            // Source might already be created - ignore
          }
        }
      } catch (err) {
        console.error("Failed to setup audio analyser:", err);
      }
    };

    // Setup when playing
    if (isPlaying) {
      setupAnalyser();
    }
  }, [isPlaying, getAudioElement]);

  return {
    analyserNode: analyserNodeRef.current,
    frequencyDataRef,
    isPlaying,
  };
}
