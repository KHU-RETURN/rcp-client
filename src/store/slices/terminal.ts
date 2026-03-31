import type { StateCreator } from 'zustand';

export interface TerminalSlice {
  terminalFullscreen: boolean;
  setTerminalFullscreen: (value: boolean) => void;
}

export const createTerminalSlice: StateCreator<TerminalSlice, [], [], TerminalSlice> = (set) => ({
  terminalFullscreen: false,
  setTerminalFullscreen: (value) => set({ terminalFullscreen: value }),
});
