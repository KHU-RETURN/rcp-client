import type { StateCreator } from 'zustand';
import type { ConnectionMode, BackendHealthStatus } from '../../types';
import { rcpConfig } from '../../config';
import { checkBackendHealth } from '../../services/health';

export interface ConnectionSlice {
  connectionMode: ConnectionMode;
  connectionReason: string;
  backendHealthStatus: BackendHealthStatus;

  ensureBackendHealth: () => Promise<void>;
  getAppHealth: () => { label: string; tone: string; detail: string };
}

export const createConnectionSlice: StateCreator<ConnectionSlice, [], [], ConnectionSlice> = (set, get) => ({
  connectionMode: rcpConfig.demoMode === 'force' ? 'demo' : 'checking',
  connectionReason: '',
  backendHealthStatus: rcpConfig.demoMode === 'force' ? 'ready' : 'idle',

  ensureBackendHealth: async () => {
    if (rcpConfig.demoMode === 'force') {
      set({ connectionMode: 'demo', connectionReason: 'config.demoMode=force', backendHealthStatus: 'ready' });
      return;
    }

    const status = get().backendHealthStatus;
    if (status === 'loading' || status === 'ready') return;

    set({ backendHealthStatus: 'loading' });

    const data = await checkBackendHealth();
    set({
      connectionMode: data.available ? 'live' : 'demo',
      connectionReason: data.available ? '' : (data.error ?? 'backend unavailable'),
      backendHealthStatus: 'ready',
    });
  },

  getAppHealth: () => {
    const mode = get().connectionMode;
    if (mode === 'live') return { label: 'Connected', tone: 'live', detail: '실시간 백엔드 연결' };
    if (mode === 'demo') return { label: 'Preview mode', tone: 'demo', detail: '로컬 데이터 기반 미리보기' };
    return { label: 'Checking', tone: 'neutral', detail: '연결 확인 중' };
  },
});
