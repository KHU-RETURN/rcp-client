export const ROUTE_NAMES = {
  login: 'login',
  signup: 'signup',
  changes: 'changes',
  sshAuth: 'ssh-auth',
  sshComplete: 'ssh-complete',
  instances: 'instances',
  storage: 'storage',
  create: 'create',
  detail: 'detail',
  result: 'result',
  terminal: 'terminal',
} as const;

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export const SECTION_ORDER = ['basic', 'compute', 'image-network', 'access', 'review'] as const;
