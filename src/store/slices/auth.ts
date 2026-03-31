import type { StateCreator } from 'zustand';
import type { Session, MockUser, SignupForm, AuthMessage } from '../../types';
import { GOOGLE_PREVIEW_USER, mockUsers } from '../../constants';

export interface AuthSlice {
  session: Session | null;
  customMockUsers: MockUser[];
  signupForm: SignupForm;
  authMessage: AuthMessage | null;
  pendingRoutePath: string | null;

  login: (user: Session, nextPath?: string) => string;
  logout: () => void;
  googleLogin: (nextPath?: string) => string;
  createMockUser: (user: MockUser) => void;
  updateSignupForm: (updates: Partial<SignupForm>) => void;
  resetSignupForm: () => void;
  setAuthMessage: (message: AuthMessage | null) => void;
  setPendingRoutePath: (path: string | null) => void;
  getAllUsers: () => MockUser[];
}

const defaultSignupForm = (): SignupForm => ({
  name: '',
  handle: '',
  rolePreset: 'student',
  subtitle: '',
});

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
  session: null,
  customMockUsers: [],
  signupForm: defaultSignupForm(),
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

  googleLogin: (nextPath) => {
    const pending = get().pendingRoutePath;
    set({
      session: GOOGLE_PREVIEW_USER,
      authMessage: null,
      pendingRoutePath: null,
    });
    return nextPath ?? pending ?? '/compute';
  },

  createMockUser: (user) => {
    set((state) => ({
      customMockUsers: [...state.customMockUsers, user],
      signupForm: defaultSignupForm(),
      session: user,
      authMessage: null,
      pendingRoutePath: null,
    }));
  },

  updateSignupForm: (updates) => {
    set((state) => ({
      signupForm: { ...state.signupForm, ...updates },
      authMessage: null,
    }));
  },

  resetSignupForm: () => {
    set({ signupForm: defaultSignupForm() });
  },

  setAuthMessage: (message) => {
    set({ authMessage: message });
  },

  setPendingRoutePath: (path) => {
    set({ pendingRoutePath: path });
  },

  getAllUsers: () => {
    return [...mockUsers, ...get().customMockUsers];
  },
});
