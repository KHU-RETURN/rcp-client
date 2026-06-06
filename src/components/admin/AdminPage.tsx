import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminInstances,
  fetchAdminSummary,
  fetchAdminSystem,
  fetchAdminUsers,
} from '../../services/admin';
import type { AdminInstance, AdminSummary, AdminSystem, AdminUser } from '../../types';
import { ROUTE_NAMES } from '../../constants';
import { Topbar } from '../layout/Topbar';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

function formatDate(value: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function statusClass(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized === 'healthy' || normalized === 'active') return 'valid';
  if (normalized === 'unknown' || normalized === 'build') return 'pending';
  return 'error';
}

function displayStatus(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized === 'healthy') return '정상';
  if (normalized === 'unknown') return '확인 전';
  if (normalized === 'active') return '실행 중';
  if (normalized === 'build') return '생성 중';
  if (normalized === 'paused') return '일시정지';
  if (normalized === 'admin') return '관리자';
  if (normalized === 'user') return '사용자';
  return value || '-';
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="mini-stat admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MockStatus({ label, value }: { label: string; value: string }) {
  const isMock = value.toLowerCase() === 'unknown';

  return (
    <div className="admin-system-item">
      <span>{label}</span>
      <strong>
        <span className={`inline-badge ${statusClass(value)}`}>{displayStatus(value)}</span>
        {isMock && <small>(mock)</small>}
      </strong>
    </div>
  );
}

export function AdminPage() {
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [instances, setInstances] = useState<AdminInstance[]>([]);
  const [system, setSystem] = useState<AdminSystem | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const [nextSummary, nextUsers, nextInstances, nextSystem] = await Promise.all([
        fetchAdminSummary(),
        fetchAdminUsers(),
        fetchAdminInstances(),
        fetchAdminSystem(),
      ]);
      setSummary(nextSummary);
      setUsers(nextUsers);
      setInstances(nextInstances);
      setSystem(nextSystem);
      setState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : '관리자 대시보드를 불러오지 못했습니다.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statusCounts = useMemo(
    () =>
      Object.entries(summary?.status_counts ?? {}).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    [summary],
  );

  return (
    <div className="page page-admin shell-enter">
      <Topbar active={ROUTE_NAMES.admin} />
      <main className="workspace admin-workspace">
        <section className="workspace-main admin-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">관리자</p>
                <h2>대시보드</h2>
                <p className="muted section-support">
                  전체 사용자, 인스턴스, 시스템 상태를 확인합니다.
                </p>
              </div>
              <button
                type="button"
                className="ghost-button"
                disabled={state === 'loading'}
                onClick={() => void loadDashboard()}
              >
                {state === 'loading' ? '새로고침 중...' : '새로고침'}
              </button>
            </div>

            {error && <p className="inline-status error">{error}</p>}

            <div className="section-stats admin-stat-grid">
              <Stat label="사용자" value={summary?.users ?? 0} />
              <Stat label="인스턴스" value={summary?.instances ?? 0} />
              <Stat label="컨테이너" value={summary?.containers ?? 0} />
              <Stat label="앱" value={summary?.apps ?? 0} />
              <Stat label="키페어" value={summary?.keypairs ?? 0} />
            </div>

            <div className="admin-grid">
              <section className="line-block admin-system">
                <div className="line-block-head">
                  <div>
                    <strong>시스템 상태</strong>
                    <p className="muted">
                      아직 실제 상태 확인이 연결되지 않은 값은 (mock)으로 표시합니다.
                    </p>
                  </div>
                </div>
                <div className="admin-system-list">
                  <MockStatus label="API" value={system?.api_status ?? 'unknown'} />
                  <MockStatus label="OpenStack" value={system?.openstack_status ?? 'unknown'} />
                  <MockStatus
                    label="SSH 게이트웨이"
                    value={system?.ssh_gateway_status ?? 'unknown'}
                  />
                  <MockStatus label="스토리지" value={system?.storage_status ?? 'unknown'} />
                </div>
                {system?.message && <p className="muted admin-system-message">{system.message}</p>}
                {system?.last_updated_at && (
                  <p className="muted admin-system-message">
                    마지막 갱신 {formatDate(system.last_updated_at)}
                  </p>
                )}
              </section>

              <section className="line-block admin-system">
                <div className="line-block-head">
                  <div>
                    <strong>인스턴스 상태</strong>
                    <p className="muted">전체 인스턴스 상태별 집계</p>
                  </div>
                </div>
                <div className="admin-status-list">
                  {statusCounts.length ? (
                    statusCounts.map(([status, count]) => (
                      <div className="admin-status-row" key={status}>
                        <span className={`inline-badge ${statusClass(status)}`}>
                          {displayStatus(status)}
                        </span>
                        <strong>{count}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="muted">인스턴스가 없습니다.</p>
                  )}
                </div>
              </section>
            </div>

            <section className="admin-table-section">
              <div className="section-head section-head-tight">
                <div>
                  <p className="eyebrow">사용자</p>
                  <h2>최근 사용자</h2>
                </div>
              </div>
              <div className="table-frame">
                <table className="flavor-table admin-table">
                  <thead>
                    <tr>
                      <th>사용자</th>
                      <th>권한</th>
                      <th>인스턴스</th>
                      <th>스토리지</th>
                      <th>앱</th>
                      <th>가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name || user.email}</strong>
                          <small>{user.email}</small>
                        </td>
                        <td>
                          <span className={`inline-badge ${statusClass(user.role)}`}>
                            {displayStatus(user.role)}
                          </span>
                        </td>
                        <td>{user.instance_count}</td>
                        <td>{user.container_count}</td>
                        <td>{user.app_count}</td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr>
                        <td colSpan={6}>사용자가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-table-section">
              <div className="section-head section-head-tight">
                <div>
                  <p className="eyebrow">컴퓨트</p>
                  <h2>최근 인스턴스</h2>
                </div>
              </div>
              <div className="table-frame">
                <table className="flavor-table admin-table">
                  <thead>
                    <tr>
                      <th>인스턴스</th>
                      <th>상태</th>
                      <th>소유자</th>
                      <th>Flavor</th>
                      <th>IP</th>
                      <th>생성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instances.map((instance) => (
                      <tr key={instance.id}>
                        <td>
                          <strong>{instance.name || instance.id}</strong>
                          <small>{instance.id}</small>
                        </td>
                        <td>
                          <span className={`inline-badge ${statusClass(instance.status)}`}>
                            {displayStatus(instance.status)}
                          </span>
                        </td>
                        <td>
                          <strong>{instance.owner_name || instance.owner_email || '-'}</strong>
                          <small>{instance.owner_email}</small>
                        </td>
                        <td>{instance.flavor_name || instance.flavor_id || '-'}</td>
                        <td>{instance.fixed_ip || '-'}</td>
                        <td>{formatDate(instance.created_at)}</td>
                      </tr>
                    ))}
                    {!instances.length && (
                      <tr>
                        <td colSpan={6}>인스턴스가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        </section>
      </main>
    </div>
  );
}
