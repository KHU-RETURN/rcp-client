const DEFAULT_LIMIT = 10;

const DEFAULT_PAGE = 1;

export function adminUsersPath(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): string {
  return `/api/v1/admin/users?page=${page}&limit=${limit}`;
}

export function adminInstancesPath(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): string {
  return `/api/v1/admin/instances?page=${page}&limit=${limit}`;
}

export function adminContainersPath(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): string {
  return `/api/v1/admin/containers?page=${page}&limit=${limit}`;
}

export function adminUserResourcesPath(userId: string): string {
  return `/api/v1/admin/users/${encodeURIComponent(userId)}/resources`;
}

export const ADMIN_SUMMARY_PATH = '/api/v1/admin/summary';
export const ADMIN_SYSTEM_PATH = '/api/v1/admin/system';
