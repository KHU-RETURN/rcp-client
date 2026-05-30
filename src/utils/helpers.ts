import type { Flavor, Instance, StatusTone } from '../types';

const TERMINAL_ACTIVE_GRACE_MS = 30_000;

export function normalizeHandle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

export function statusTone(status: string | null | undefined): StatusTone {
  const upper = String(status ?? '').toUpperCase();
  if (upper === 'ACTIVE') return 'valid';
  if (upper === 'BUILD') return 'pending';
  if (upper === 'ERROR' || upper === 'FAILED') return 'error';
  return 'pending';
}

export function getRecommendation(flavor: Flavor, index: number): string {
  if (flavor.max_configurable === 0) return 'Quota limit';
  if (index === 1) return 'Balanced';
  if (index === 0) return 'Fast start';
  return 'Available';
}

export function sortFlavors(flavors: Flavor[]): Flavor[] {
  return [...flavors].sort((a, b) => {
    if (b.max_configurable !== a.max_configurable) {
      return b.max_configurable - a.max_configurable;
    }
    return a.vcpus - b.vcpus;
  });
}

export function translateError(message: string | undefined | null): string {
  if (!message) return '알 수 없는 오류가 발생했습니다.';
  const lower = message.toLowerCase();
  if (lower.includes('invalid request body')) return '입력값 형식이 올바르지 않습니다.';
  if (lower.includes('name already exists')) return '같은 이름의 키가 이미 존재합니다.';
  if (lower.includes('failed to create keypair')) return '공개키 등록 중 문제가 발생했습니다.';
  if (lower.includes('failed to connect to cloud'))
    return '클라우드 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  if (lower.includes('proxy failed') || lower.includes('failed to fetch'))
    return '백엔드에 연결하지 못했습니다.';
  return message;
}

export function getDisplayInstanceId(id: string): string {
  return String(id).replace(/^mock-/, '');
}

export function getTerminalAvailability(
  instance: Instance | null | undefined,
  now = Date.now(),
): { canOpen: boolean; waitSeconds: number; reason: string } {
  if (!instance) {
    return { canOpen: false, waitSeconds: 0, reason: 'No instance selected' };
  }

  const status = String(instance.status ?? '').toUpperCase();
  if (status !== 'ACTIVE') {
    return {
      canOpen: false,
      waitSeconds: 0,
      reason: `Instance is ${instance.status || 'not ready'}`,
    };
  }

  const activeAt = Date.parse(instance.updated || instance.created);
  if (!Number.isFinite(activeAt)) {
    return { canOpen: true, waitSeconds: 0, reason: 'Ready' };
  }

  const remainingMs = TERMINAL_ACTIVE_GRACE_MS - (now - activeAt);
  if (remainingMs <= 0) {
    return { canOpen: true, waitSeconds: 0, reason: 'Ready' };
  }

  return {
    canOpen: false,
    waitSeconds: Math.ceil(remainingMs / 1000),
    reason: 'Finalizing console',
  };
}

export function getVisibleInstances(
  instances: Instance[],
  query: string,
  statusFilter: string,
): Instance[] {
  const q = query.trim().toLowerCase();
  return instances.filter((instance) => {
    const matchesQuery =
      !q ||
      instance.name.toLowerCase().includes(q) ||
      instance.id.toLowerCase().includes(q) ||
      instance.flavorId.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || String(instance.status ?? '').toLowerCase() === statusFilter;
    return matchesQuery && matchesStatus;
  });
}
