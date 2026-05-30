import { useEffect, useRef, useCallback, useState } from 'react';
import { rcpConfig } from '../config';
import { TERMINAL_OPTIONS } from '../constants';
import { apiRequest } from '../services/api';
import type { Instance } from '../types';
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';

interface TerminalModulesRef {
  Terminal: typeof Terminal;
  FitAddon: typeof FitAddon;
}

interface TerminalRuntimeRef {
  instanceId: string;
  terminal: Terminal;
  fitAddon: FitAddon;
  socket: WebSocket | null;
  decoder: TextDecoder;
  resizeHandler: () => void;
  resizeObserver: ResizeObserver | null;
  onDataDispose: { dispose: () => void } | null;
}

interface ConsoleSessionResponse {
  url: string;
}

interface UseTerminalReturn {
  isConnected: boolean;
  clear: () => void;
  reconnect: () => void;
}

async function createConsoleSession(inst: Instance): Promise<ConsoleSessionResponse> {
  return apiRequest<ConsoleSessionResponse>(
    `/api/v1/access/instances/${encodeURIComponent(inst.id)}/console-sessions`,
    {
      method: 'POST',
      body: JSON.stringify({ username: 'ubuntu' }),
    },
  );
}

function resolveWebSocketUrl(rawUrl: string): string {
  const baseUrl = rcpConfig.apiBaseUrl || window.location.origin;
  const url = new URL(rawUrl, baseUrl);

  if (url.protocol === 'http:') url.protocol = 'ws:';
  if (url.protocol === 'https:') url.protocol = 'wss:';

  return url.toString();
}

export function useTerminal(
  instance: Instance | null,
  hostRef: React.RefObject<HTMLDivElement | null>,
): UseTerminalReturn {
  const modulesRef = useRef<TerminalModulesRef | null>(null);
  const runtimeRef = useRef<TerminalRuntimeRef | null>(null);
  const setupVersionRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  const dispose = useCallback(() => {
    setupVersionRef.current += 1;
    const rt = runtimeRef.current;
    if (!rt) return;
    window.removeEventListener('resize', rt.resizeHandler);
    rt.resizeObserver?.disconnect();
    rt.onDataDispose?.dispose();
    rt.socket?.close();
    rt.terminal.dispose();
    runtimeRef.current = null;
    setIsConnected(false);
  }, []);

  const connect = useCallback(
    async (rt: TerminalRuntimeRef, inst: Instance, setupVersion: number) => {
      const term = rt.terminal;
      term.write(`[Creating console session for ${inst.name}...]\r\n`);

      try {
        const session = await createConsoleSession(inst);
        if (!session.url) throw new Error('console session response did not include a url');
        if (setupVersion !== setupVersionRef.current || runtimeRef.current !== rt) return;

        term.write('[Opening WebSocket...]\r\n');

        const socketUrl = resolveWebSocketUrl(session.url);
        console.info('[useTerminal] opening websocket', {
          instanceId: inst.id,
          url: socketUrl,
        });

        const socket = new WebSocket(socketUrl);
        socket.binaryType = 'arraybuffer';
        rt.socket = socket;

        socket.onopen = () => {
          console.info('[useTerminal] websocket open', { instanceId: inst.id });
          setIsConnected(true);
          term.write('[Connected]\r\n\r\n');
          term.focus();
        };

        socket.onmessage = async (event) => {
          if (typeof event.data === 'string') {
            term.write(event.data);
            return;
          }

          if (event.data instanceof ArrayBuffer) {
            term.write(rt.decoder.decode(new Uint8Array(event.data)));
            return;
          }

          if (event.data instanceof Blob) {
            const buffer = await event.data.arrayBuffer();
            term.write(rt.decoder.decode(new Uint8Array(buffer)));
          }
        };

        socket.onerror = (event) => {
          console.error('[useTerminal] websocket error', {
            instanceId: inst.id,
            url: socketUrl,
            event,
          });
          term.write('\r\n[WebSocket error]\r\n');
        };

        socket.onclose = (event) => {
          console.info('[useTerminal] websocket close', {
            instanceId: inst.id,
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          setIsConnected(false);
          term.write('\r\n[Disconnected]\r\n');
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown terminal error';
        term.write(`\r\n[Error] ${message}\r\n`);
        console.error(error);
      }
    },
    [],
  );

  const setup = useCallback(async () => {
    if (!instance || !hostRef.current) return;
    if (runtimeRef.current?.instanceId === instance.id) return;

    dispose();
    const setupVersion = setupVersionRef.current;

    if (!modulesRef.current) {
      const [xtermMod, fitMod] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);

      if (setupVersion !== setupVersionRef.current) return;

      modulesRef.current = {
        Terminal: xtermMod.Terminal,
        FitAddon: fitMod.FitAddon,
      };
    }

    const { Terminal: TermClass, FitAddon: FitClass } = modulesRef.current;
    const terminal = new TermClass(TERMINAL_OPTIONS);
    const fitAddon = new FitClass();
    terminal.loadAddon(fitAddon);

    if (hostRef.current) {
      hostRef.current.innerHTML = '';
      terminal.open(hostRef.current);
      fitAddon.fit();
    }

    const fit = () => {
      window.requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch {
          // xterm may briefly have no measurable container during fullscreen transitions.
        }
      });
    };

    const rt: TerminalRuntimeRef = {
      instanceId: instance.id,
      terminal,
      fitAddon,
      socket: null,
      decoder: new TextDecoder(),
      resizeHandler: fit,
      resizeObserver: null,
      onDataDispose: null,
    };

    window.addEventListener('resize', rt.resizeHandler);
    rt.resizeObserver = new ResizeObserver(rt.resizeHandler);
    rt.resizeObserver.observe(hostRef.current);
    rt.onDataDispose = terminal.onData((data) => {
      if (rt.socket?.readyState === WebSocket.OPEN) {
        rt.socket.send(data);
      }
    });
    runtimeRef.current = rt;
    rt.resizeHandler();

    await connect(rt, instance, setupVersion);
  }, [connect, dispose, hostRef, instance]);

  useEffect(() => {
    void setup();
    return () => {
      dispose();
    };
  }, [dispose, setup]);

  const clear = useCallback(() => {
    runtimeRef.current?.terminal.clear();
  }, []);

  const reconnect = useCallback(() => {
    dispose();
    void setup();
  }, [dispose, setup]);

  return {
    isConnected,
    clear,
    reconnect,
  };
}
