import type { AdminInstance, AdminSummary, AdminSystem, AdminUser } from '../types';
import { apiRequest } from './api';
import {
  ADMIN_SUMMARY_PATH,
  ADMIN_SYSTEM_PATH,
  adminInstancesPath,
  adminUsersPath,
} from './admin-paths';

export function fetchAdminSummary(): Promise<AdminSummary> {
  return apiRequest<AdminSummary>(ADMIN_SUMMARY_PATH);
}

export function fetchAdminUsers(limit?: number): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>(adminUsersPath(limit));
}

export function fetchAdminInstances(limit?: number): Promise<AdminInstance[]> {
  return apiRequest<AdminInstance[]>(adminInstancesPath(limit));
}

export function fetchAdminSystem(): Promise<AdminSystem> {
  return apiRequest<AdminSystem>(ADMIN_SYSTEM_PATH);
}
