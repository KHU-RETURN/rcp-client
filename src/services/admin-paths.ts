const DEFAULT_LIMIT = 100;

export function adminUsersPath(limit = DEFAULT_LIMIT): string {
  return `/api/v1/admin/users?limit=${limit}`;
}

export function adminInstancesPath(limit = DEFAULT_LIMIT): string {
  return `/api/v1/admin/instances?limit=${limit}`;
}

export const ADMIN_SUMMARY_PATH = '/api/v1/admin/summary';
export const ADMIN_SYSTEM_PATH = '/api/v1/admin/system';
