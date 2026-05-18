import type { RcpConfig } from './types';

export const rcpConfig: RcpConfig = {
  apiBaseUrl: (import.meta.env.VITE_RCP_API_BASE_URL ?? '').replace(/\/$/, ''),
};
