import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/player.store';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  return ['INPUT', 'TEXTAREA'].includes(el.tagName) || el.isContentEditable;
}

export const usePlayerKeyboardShortcuts = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) {
        return;
      }
      const { toggle, seek, state } = usePlayerStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          seek(Math.max(0, state.positionSec - 10));
          break;
        case 'ArrowRight':
          seek(state.positionSec + 10);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
