import type {
  AdminContainer,
  AdminInstance,
  AdminPaginatedResponse,
  AdminSummary,
  AdminSystem,
  AdminUser,
  AdminUserResources,
} from '../types';
import { apiRequest } from './api';
import {
  ADMIN_SUMMARY_PATH,
  ADMIN_SYSTEM_PATH,
  adminContainersPath,
  adminInstancesPath,
  adminUserResourcesPath,
  adminUsersPath,
} from './admin-paths';

export function fetchAdminSummary(): Promise<AdminSummary> {
  return apiRequest<AdminSummary>(ADMIN_SUMMARY_PATH);
}

export function fetchAdminUsers(
  page?: number,
  limit?: number,
): Promise<AdminPaginatedResponse<AdminUser>> {
  return apiRequest<AdminPaginatedResponse<AdminUser>>(adminUsersPath(page, limit));
}

export function fetchAdminInstances(
  page?: number,
  limit?: number,
): Promise<AdminPaginatedResponse<AdminInstance>> {
  return apiRequest<AdminPaginatedResponse<AdminInstance>>(adminInstancesPath(page, limit));
}

export function fetchAdminContainers(
  page?: number,
  limit?: number,
): Promise<AdminPaginatedResponse<AdminContainer>> {
  return apiRequest<AdminPaginatedResponse<AdminContainer>>(adminContainersPath(page, limit));
}

export function fetchAdminUserResources(userId: string): Promise<AdminUserResources> {
  return apiRequest<AdminUserResources>(adminUserResourcesPath(userId));
}

export function fetchAdminSystem(): Promise<AdminSystem> {
  return apiRequest<AdminSystem>(ADMIN_SYSTEM_PATH);
}
