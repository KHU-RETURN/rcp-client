import type { RcpConfig, DemoMode } from './types';

function resolveDemoMode(raw: string): DemoMode {
  return raw === 'force' ? 'force' : 'auto';
}

export const rcpConfig: RcpConfig = {
  apiBaseUrl: (import.meta.env.VITE_RCP_API_BASE_URL ?? '').replace(/\/$/, ''),
  demoMode: resolveDemoMode(import.meta.env.VITE_RCP_DEMO_MODE ?? 'auto'),
};
