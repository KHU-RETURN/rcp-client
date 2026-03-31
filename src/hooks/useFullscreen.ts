import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

export function useFullscreen(shellRef: React.RefObject<HTMLElement | null>) {
  const { terminalFullscreen, setTerminalFullscreen } = useStore();

  useEffect(() => {
    function onFullscreenChange() {
      const shell = shellRef.current;
      const isFs = Boolean(
        document.fullscreenElement &&
          shell &&
          (document.fullscreenElement === shell || shell.contains(document.fullscreenElement)),
      );
      setTerminalFullscreen(isFs);
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [shellRef, setTerminalFullscreen]);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void shell.requestFullscreen();
    }
  }, [shellRef]);

  return { isFullscreen: terminalFullscreen, toggleFullscreen };
}
