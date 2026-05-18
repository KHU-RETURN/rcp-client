import type { StateCreator } from 'zustand';
import type { Session, AuthMessage } from '../../types';

export interface AuthSlice {
  session: Session | null;
  authMessage: AuthMessage | null;
  pendingRoutePath: string | null;

  login: (user: Session, nextPath?: string) => string;
  logout: () => void;
  setAuthMessage: (message: AuthMessage | null) => void;
  setPendingRoutePath: (path: string | null) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
  session: null,
  authMessage: null,
  pendingRoutePath: null,

  login: (user, nextPath) => {
    const pending = get().pendingRoutePath;
    set({
      session: user,
      authMessage: null,
      pendingRoutePath: null,
    });
    return nextPath ?? pending ?? '/compute';
  },

  logout: () => {
    set({ session: null, pendingRoutePath: null, authMessage: null });
  },

  setAuthMessage: (message) => {
    set({ authMessage: message });
  },

  setPendingRoutePath: (path) => {
    set({ pendingRoutePath: path });
  },
});
