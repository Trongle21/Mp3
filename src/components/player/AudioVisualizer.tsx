"use client";

import { useEffect, useRef } from "react";
import { useAudioAnalyser } from "@/hooks/useAudioAnalyser";

interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
  barColor?: string;
  mirror?: boolean;
}

export function AudioVisualizer({
  className = "",
  barCount = 64,
  barColor = "#1db954",
  mirror = true,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const { analyserNode, frequencyDataRef, isPlaying } = useAudioAnalyser();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (!analyserNode || frequencyDataRef.current.length === 0) {
        // Draw idle state bars
        const idleHeight = 4;
        const barWidth = width / barCount - 2;
        const gap = 2;

        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + gap);
          const barHeight = idleHeight;

          ctx.fillStyle = "rgba(29, 185, 84, 0.3)";
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, 2);
          ctx.fill();

          if (mirror) {
            ctx.beginPath();
            ctx.roundRect(x, 0, barWidth, barHeight, 2);
            ctx.fill();
          }
        }
        return;
      }

      // Calculate bar width
      const gap = 2;
      const barWidth = (width - gap * (barCount - 1)) / barCount;
      const centerY = height / 2;

      // Sample frequency data
      const step = Math.floor(frequencyDataRef.current.length / barCount);

      for (let i = 0; i < barCount; i++) {
        // Get average of frequency range
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += frequencyDataRef.current[i * step + j] || 0;
        }
        const value = sum / step;

        // Normalize and apply minimum height
        const normalizedValue = value / 255;
        const maxBarHeight = height / 2 - 4;
        const barHeight = Math.max(4, normalizedValue * maxBarHeight);

        const x = i * (barWidth + gap);

        // Create gradient
        const gradient = ctx.createLinearGradient(
          0,
          centerY - barHeight,
          0,
          centerY + barHeight,
        );
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(0.5, `${barColor}88`);
        gradient.addColorStop(1, barColor);

        ctx.fillStyle = gradient;

        // Draw top bar
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, 2);
        ctx.fill();

        // Draw bottom bar (mirror)
        if (mirror) {
          ctx.beginPath();
          ctx.roundRect(x, centerY, barWidth, barHeight, 2);
          ctx.fill();
        }
      }
    };

    // Animation loop: reads fresh frequency data every frame, draws it,
    // then schedules itself again while playing.
    const tick = () => {
      if (analyserNode && frequencyDataRef.current.length > 0) {
        analyserNode.getByteFrequencyData(
          frequencyDataRef.current as Uint8Array<ArrayBuffer>,
        );
      }
      draw();

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(tick);
    } else {
      // Draw idle state once, no loop needed
      draw();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, frequencyDataRef, isPlaying, barCount, barColor, mirror]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
