'use client';

import { useEffect, useRef } from 'react';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';

interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
}

// Multi-stop gradient: cyan → violet → magenta → accent green.
// Each bar samples a color along this ramp for a cohesive but vivid look.
const PALETTE = ['#22d3ee', '#a855f7', '#ec4899', '#1db954'];

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function sampleColor(t: number): string {
  const n = PALETTE.length - 1;
  const idx = Math.min(n - 1, Math.max(0, Math.floor(t * n)));
  const local = t * n - idx;
  const [r1, g1, b1] = hexToRgb(PALETTE[idx]);
  const [r2, g2, b2] = hexToRgb(PALETTE[idx + 1]);
  const r = Math.round(r1 + (r2 - r1) * local);
  const g = Math.round(g1 + (g2 - g1) * local);
  const b = Math.round(b1 + (b2 - b1) * local);
  return `rgb(${r},${g},${b})`;
}

export function AudioVisualizer({
  className = '',
  barCount = 56,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const {
    analyser,
    ensureGraph,
    frequencyDataRef,
    getAudioElement,
    isPlaying,
    ready,
  } = useAudioAnalyser();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Sync the graph and frequencyDataRef the moment the component mounts.
    // This covers the remount scenario: analyser is a module-level singleton
    // so React's diffing never re-runs the effect unless we add `ready` to
    // the dependency array below.
    if (ready && analyser) {
      const audio = getAudioElement();
      if (audio && !audio.paused) {
        ensureGraph(audio);
      }
      if (frequencyDataRef.current.length !== analyser.frequencyBinCount) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
    }

    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // Reset transform before re-scaling — without this, repeated resizes
    // accumulate scale and bars drift out of the canvas.
    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const drawIdle = (w: number, h: number, t: number) => {
      ctx.clearRect(0, 0, w, h);
      const gap = 3;
      const barWidth = (w - gap * (barCount - 1)) / barCount;
      const centerY = h / 2;
      const maxBar = h / 2 - 6;

      // Per-bar unique phases → bars don't pulse in lockstep.
      for (let i = 0; i < barCount; i++) {
        const seed = i * 0.7;
        const phase =
          Math.sin(t / 500 + seed) * 0.5 + Math.sin(t / 900 + seed * 1.3) * 0.5;
        const amp = (phase + 1) / 2;
        const barHeight = 4 + Math.pow(amp, 1.5) * maxBar * 0.25;
        const x = i * (barWidth + gap);
        const color = sampleColor(i / barCount);

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x, centerY, barWidth, barHeight, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawActive = (w: number, h: number) => {
      // Keep the ref in sync with the analyser in case it changed size
      // (e.g. fftSize tweaked) after the hook's own effect last ran.
      if (
        analyser &&
        frequencyDataRef.current.length !== analyser.frequencyBinCount
      ) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }

      const hasData = analyser && frequencyDataRef.current.length > 0;
      if (!hasData) {
        drawIdle(w, h, performance.now());
        return;
      }

      analyser.getByteFrequencyData(
        frequencyDataRef.current as Uint8Array<ArrayBuffer>
      );
      ctx.clearRect(0, 0, w, h);

      const gap = 3;
      const barWidth = (w - gap * (barCount - 1)) / barCount;
      const centerY = h / 2;
      const maxBar = h / 2 - 2;
      const step = Math.max(
        1,
        Math.floor(frequencyDataRef.current.length / barCount)
      );

      for (let i = 0; i < barCount; i++) {
        // Pick MAX across the bin range → bars react to peaks, not the
        // smoothed average. This is what makes them "jump with the music".
        let peak = 0;
        for (let j = 0; j < step; j++) {
          const v = frequencyDataRef.current[i * step + j] ?? 0;
          if (v > peak) {
            peak = v;
          }
        }
        const value = peak / 255;
        // Lower gamma → bars fill the canvas even on quiet passages.
        const barHeight = Math.max(4, Math.pow(value, 0.6) * maxBar);
        const x = i * (barWidth + gap);
        const color = sampleColor(i / barCount);

        // Body glow.
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x, centerY, barWidth, barHeight, 2);
        ctx.fill();

        // Bright cap on top — gives the "audio peaking" feel.
        const capH = Math.min(3, barHeight);
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, capH, 1.5);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(x, centerY + barHeight - capH, barWidth, capH, 1.5);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.shadowBlur = 0;
    };

    const tick = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (isPlaying && analyser && ready) {
        drawActive(w, h);
      } else {
        drawIdle(w, h, performance.now());
      }
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isPlaying, barCount]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
      />
    </div>
  );
}
