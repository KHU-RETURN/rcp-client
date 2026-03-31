import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { TERMINAL_OPTIONS } from '../constants';
import { wait } from '../utils';
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
  commandBuffer: string;
  connected: boolean;
  resizeHandler: () => void;
  onDataDispose: { dispose: () => void } | null;
}

interface UseTerminalReturn {
  isConnected: boolean;
  clear: () => void;
  reconnect: () => void;
}

export function useTerminal(
  instance: Instance | null,
  hostRef: React.RefObject<HTMLDivElement | null>,
): UseTerminalReturn {
  const { session } = useStore();
  const modulesRef = useRef<TerminalModulesRef | null>(null);
  const runtimeRef = useRef<TerminalRuntimeRef | null>(null);
  const isConnectedRef = useRef(false);

  function dispose() {
    const rt = runtimeRef.current;
    if (!rt) return;
    window.removeEventListener('resize', rt.resizeHandler);
    rt.onDataDispose?.dispose();
    rt.terminal.dispose();
    runtimeRef.current = null;
    isConnectedRef.current = false;
  }

  const setup = useCallback(async () => {
    if (!instance || !hostRef.current) return;
    if (runtimeRef.current?.instanceId === instance.id) return;

    dispose();

    if (!modulesRef.current) {
      const [xtermMod, fitMod] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
      ]);
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

    const rt: TerminalRuntimeRef = {
      instanceId: instance.id,
      terminal,
      fitAddon,
      commandBuffer: '',
      connected: false,
      resizeHandler: () => fitAddon.fit(),
      onDataDispose: null,
    };

    window.addEventListener('resize', rt.resizeHandler);
    rt.onDataDispose = terminal.onData((data) => handleInput(rt, data, instance));
    runtimeRef.current = rt;

    await boot(rt, instance);
  }, [instance, hostRef]);

  async function boot(rt: TerminalRuntimeRef, inst: Instance) {
    const term = rt.terminal;
    const sessionId = session?.id ?? 'operator';
    const lines = [
      '\u001B[1;34mRCP terminal\u001B[0m',
      `target: ${inst.name} (${inst.id})`,
      inst.mode === 'live' ? 'backend: live create path verified' : 'backend: local fallback mode',
      'transport: xterm session (websocket backend not implemented yet)',
      'type "help" to see supported commands.',
      '',
    ];

    for (const line of lines) {
      term.writeln(line);
      await wait(80);
    }

    rt.connected = true;
    isConnectedRef.current = true;
    renderPrompt(rt, inst, sessionId);
  }

  function renderPrompt(rt: TerminalRuntimeRef, inst: Instance, sessionId: string) {
    rt.commandBuffer = '';
    rt.terminal.write(
      `\r\n\u001B[1;32m${sessionId}@${inst.name}\u001B[0m:\u001B[1;34m~\u001B[0m$ `,
    );
  }

  function handleInput(rt: TerminalRuntimeRef, data: string, inst: Instance) {
    if (!rt.connected) return;
    const sessionId = session?.id ?? 'operator';

    switch (data) {
      case '\r': {
        const cmd = rt.commandBuffer.trim();
        rt.terminal.write('\r\n');
        runCommand(rt, cmd, inst, sessionId);
        return;
      }
      case '\u007f': {
        if (rt.commandBuffer.length > 0) {
          rt.commandBuffer = rt.commandBuffer.slice(0, -1);
          rt.terminal.write('\b \b');
        }
        return;
      }
      case '\u0003': {
        rt.terminal.write('^C');
        renderPrompt(rt, inst, sessionId);
        return;
      }
      default: {
        if (data >= ' ') {
          rt.commandBuffer += data;
          rt.terminal.write(data);
        }
      }
    }
  }

  function runCommand(rt: TerminalRuntimeRef, command: string, inst: Instance, sessionId: string) {
    const normalized = command.trim();
    if (!normalized) {
      renderPrompt(rt, inst, sessionId);
      return;
    }

    if (normalized === 'clear') {
      rt.terminal.clear();
      renderPrompt(rt, inst, sessionId);
      return;
    }

    if (normalized === 'exit') {
      rt.terminal.writeln('closing session...');
      window.setTimeout(() => window.history.back(), 180);
      return;
    }

    const responses: Record<string, string[]> = {
      help: ['available commands:', '  help, ls, pwd, whoami, hostname, ip addr, cat instance.txt, uptime, clear, exit'],
      ls: ['instance.txt  logs/  tmp/'],
      pwd: ['/home/operator'],
      whoami: [sessionId],
      hostname: [inst.name],
      'ip addr': [
        'eth0: inet 10.10.0.24/24 scope global eth0',
        inst.networkId ? `network-id: ${inst.networkId}` : 'network-id: not attached',
      ],
      'cat instance.txt': [
        `name=${inst.name}`,
        `id=${inst.id}`,
        `status=${inst.status}`,
        `flavor=${inst.flavorId}`,
        `image=${inst.imageId}`,
        `source=${inst.source}`,
        `key=${inst.keyName || 'none'}`,
      ],
      uptime: [' 20:53:12 up 3 days,  2 users,  load average: 0.06, 0.08, 0.10'],
    };

    const resp = responses[normalized];
    if (resp) {
      resp.forEach((line) => rt.terminal.writeln(line));
    } else {
      rt.terminal.writeln(`command not found: ${normalized}`);
      rt.terminal.writeln('type "help" to inspect the session.');
    }

    renderPrompt(rt, inst, sessionId);
  }

  useEffect(() => {
    void setup();
    return () => {
      dispose();
    };
  }, [setup]);

  const clear = useCallback(() => {
    runtimeRef.current?.terminal.clear();
  }, []);

  const reconnect = useCallback(() => {
    dispose();
    void setup();
  }, [setup]);

  return {
    isConnected: isConnectedRef.current,
    clear,
    reconnect,
  };
}
