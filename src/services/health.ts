import { apiRequest } from './api';
import type { BackendHealthResponse } from '../types';

export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  /*
  try {
    return await apiRequest<BackendHealthResponse>('/__health/backend');
  } catch {
    return { available: false, error: 'Failed to reach health endpoint' };
  }
  */

  return {
    available: true,
    target: import.meta.env.VITE_RCP_API_BASE_URL || 'https://localhost:8080'
  };
}
