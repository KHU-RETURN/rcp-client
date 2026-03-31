export type ConnectionMode = 'checking' | 'demo' | 'live';
export type DemoMode = 'auto' | 'force';
export type BackendHealthStatus = 'idle' | 'loading' | 'ready';
export type FlavorsStatus = 'idle' | 'loading' | 'ready';

export interface RcpConfig {
  apiBaseUrl: string;
  demoMode: DemoMode;
}
