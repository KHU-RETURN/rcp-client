import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';

export interface TerminalRuntime {
  instanceId: string;
  terminal: Terminal;
  fitAddon: FitAddon;
  commandBuffer: string;
  connected: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  onDataDispose: { dispose: () => void } | null;
  resizeHandler: () => void;
}
