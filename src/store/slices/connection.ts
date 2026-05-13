import type { StateCreator } from 'zustand';
import type { ConnectionMode } from '../../types';
import { rcpConfig } from '../../config';

export interface ConnectionSlice {
  connectionMode: ConnectionMode;
  connectionReason: string;

  getConnectionStatus: () => { label: string; tone: string; detail: string };
}

export const createConnectionSlice: StateCreator<ConnectionSlice, [], [], ConnectionSlice> = (set, get) => ({
  connectionMode: rcpConfig.demoMode === 'force' ? 'demo' : 'live',
  connectionReason: rcpConfig.demoMode === 'force' ? 'config.demoMode=force' : '',

  getConnectionStatus: () => {
    const mode = get().connectionMode;
    if (mode === 'live') return { label: 'Connected', tone: 'live', detail: '실시간 백엔드 연결' };
    if (mode === 'demo') return { label: 'Preview mode', tone: 'demo', detail: '로컬 데이터 기반 미리보기' };
    return { label: 'Connected', tone: 'live', detail: '실시간 백엔드 연결' };
  },
});
