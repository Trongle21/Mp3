"use client";

import { useEffect, useRef } from "react";

interface MusicVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export function MusicVisualizer({
  isPlaying,
  barCount = 4,
  className = "",
}: MusicVisualizerProps) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!isPlaying) {
      refs.current.forEach((el) => {
        if (el) el.style.height = "20%";
      });
      return;
    }

    const animations = refs.current.map((el, i) => {
      if (!el) return null;
      let timeout: ReturnType<typeof setTimeout>;

      const animate = () => {
        const height = 20 + Math.random() * 80;
        el.style.height = `${height}%`;
        const delay = 100 + Math.random() * 250 + i * 40;
        timeout = setTimeout(animate, delay);
      };

      animate();
      return () => clearTimeout(timeout);
    });

    return () => {
      animations.forEach((cleanup) => cleanup?.());
    };
  }, [isPlaying]);

  return (
    <div
      className={`flex h-3.5 w-4 items-end justify-center gap-[2px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="block w-[2px] rounded-full bg-accent transition-[height] duration-150 ease-out"
          style={{ height: "20%" }}
        />
      ))}
    </div>
  );
}
