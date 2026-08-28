import { usePlayerStore } from "@/stores/player.store";

export function usePlayer() {
  const state = usePlayerStore((s) => s.state);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const toggle = usePlayerStore((s) => s.toggle);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const getAudioElement = usePlayerStore((s) => s.getAudioElement);

  return {
    ...state,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    next,
    previous,
    setRepeatMode,
    toggleShuffle,
    setQueue,
    addToQueue,
    reorderQueue,
    getAudioElement,
  };
}
