import { useEffect, useRef, useState } from 'react';
import { resolveEasterEggInput } from './easter-eggs';
import type { EasterEgg } from './easter-eggs';

const EASTER_EGG_VISIBLE_MS = 4200;

export function useEasterEggs() {
  const [activeEgg, setActiveEgg] = useState<EasterEgg | null>(null);
  const bufferRef = useRef('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.isComposing || isEditableTarget(event.target)) {
        return;
      }

      const next = resolveEasterEggInput(bufferRef.current, event.key);
      bufferRef.current = next.buffer;

      if (!next.egg) {
        return;
      }

      setActiveEgg(next.egg);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setActiveEgg(null);
        timeoutRef.current = null;
      }, EASTER_EGG_VISIBLE_MS);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return activeEgg;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
