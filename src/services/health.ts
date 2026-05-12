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
    target: 'https://return-api.khu-return.com', // 실제 배포된 서버 주소
  };
}
