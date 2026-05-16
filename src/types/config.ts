export type ConnectionMode = 'demo' | 'live';
export type DemoMode = 'auto' | 'force';
export type FlavorsStatus = 'idle' | 'loading' | 'ready';

export interface RcpConfig {
  apiBaseUrl: string;
  demoMode: DemoMode;
}
