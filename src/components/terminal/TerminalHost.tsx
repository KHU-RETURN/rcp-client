import { useRef } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import type { Instance } from '../../types';

interface TerminalHostProps {
  instance: Instance | null;
  onClearRef: React.MutableRefObject<(() => void) | null>;
  onReconnectRef: React.MutableRefObject<(() => void) | null>;
}

export function TerminalHost({ instance, onClearRef, onReconnectRef }: TerminalHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { clear, reconnect } = useTerminal(instance, hostRef);

  onClearRef.current = clear;
  onReconnectRef.current = reconnect;

  return <div ref={hostRef} id="terminal-host" className="terminal-host" data-ui="terminal-host" />;
}
