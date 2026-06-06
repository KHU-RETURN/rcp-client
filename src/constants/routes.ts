export const ROUTE_NAMES = {
  login: 'login',
  signup: 'signup',
  changes: 'changes',
  instances: 'instances',
  storage: 'storage',
  create: 'create',
  detail: 'detail',
  terminal: 'terminal',
  admin: 'admin',
} as const;

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export const SECTION_ORDER = ['basic', 'image-network', 'compute', 'access', 'review'] as const;
