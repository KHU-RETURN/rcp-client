import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAdminContainers,
  fetchAdminInstances,
  fetchAdminSummary,
  fetchAdminSystem,
  fetchAdminUsers,
} from '../../services/admin';
import type {
  AdminContainer,
  AdminInstance,
  AdminPaginatedResponse,
  AdminPagination,
  AdminSummary,
  AdminSystem,
  AdminUser,
} from '../../types';
import { ROUTE_NAMES } from '../../constants';
import { Topbar } from '../layout/Topbar';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const PAGE_SIZE = 10;

const emptyPagination: AdminPagination = {
  page: 1,
  per_page: PAGE_SIZE,
  total: 0,
  total_pages: 0,
};

function emptyPage<T>(): AdminPaginatedResponse<T> {
  return { items: [], pagination: emptyPagination };
}

function formatDate(value: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function statusClass(value: string): string {
  const normalized = value.toLowerCase();
  if (['healthy', 'active', 'ready', 'registered'].includes(normalized)) return 'valid';
  if (normalized === 'unknown' || normalized === 'build') return 'pending';
  return 'error';
}

function displayStatus(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized === 'healthy') return '정상';
  if (normalized === 'unknown') return '확인 전';
  if (normalized === 'active') return '실행 중';
  if (normalized === 'ready') return '준비됨';
  if (normalized === 'registered') return '등록됨';
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

function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-badge ${statusClass(value)}`}>{displayStatus(value)}</span>;
}

function MockStatus({ label, value }: { label: string; value: string }) {
  const isMock = value.toLowerCase() === 'unknown';

  return (
    <div className="admin-system-item">
      <span>{label}</span>
      <strong>
        <StatusBadge value={value} />
        {isMock && <small>(mock)</small>}
      </strong>
    </div>
  );
}

function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: AdminPagination;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(pagination.total_pages, 1);
  const canPrev = pagination.page > 1;
  const canNext = pagination.page < totalPages;

  return (
    <div className="admin-pagination">
      <span>
        {pagination.total ? `${pagination.page} / ${totalPages}` : '0 / 0'} · 총 {pagination.total}
        개
      </span>
      <div>
        <button
          type="button"
          className="ghost-button ghost-button-small"
          disabled={!canPrev}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          이전 10개
        </button>
        <button
          type="button"
          className="ghost-button ghost-button-small"
          disabled={!canNext}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          다음 10개
        </button>
      </div>
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminPaginatedResponse<AdminUser>>(emptyPage);
  const [instances, setInstances] = useState<AdminPaginatedResponse<AdminInstance>>(emptyPage);
  const [containers, setContainers] = useState<AdminPaginatedResponse<AdminContainer>>(emptyPage);
  const [system, setSystem] = useState<AdminSystem | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [instancePage, setInstancePage] = useState(1);
  const [containerPage, setContainerPage] = useState(1);

  const loadDashboard = useCallback(async () => {
    try {
      setState('loading');
      setError(null);
      const [nextSummary, nextUsers, nextInstances, nextContainers, nextSystem] = await Promise.all(
        [
          fetchAdminSummary(),
          fetchAdminUsers(userPage, PAGE_SIZE),
          fetchAdminInstances(instancePage, PAGE_SIZE),
          fetchAdminContainers(containerPage, PAGE_SIZE),
          fetchAdminSystem(),
        ],
      );
      setSummary(nextSummary);
      setUsers(nextUsers);
      setInstances(nextInstances);
      setContainers(nextContainers);
      setSystem(nextSystem);
      setState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : '관리자 대시보드를 불러오지 못했습니다.');
      setState('error');
    }
  }, [userPage, instancePage, containerPage]);

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
                  전체 사용자, 컴퓨트, 스토리지와 유저별 리소스 상태를 확인합니다.
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
              <Stat label="키페어" value={summary?.keypairs ?? 0} />
            </div>

            <section className="admin-table-section">
              <div className="section-head section-head-tight">
                <div>
                  <p className="eyebrow">사용자</p>
                  <h2>유저</h2>
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
                      <th>가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.items.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => navigate(`/admin/users/${encodeURIComponent(user.id)}`)}
                      >
                        <td>
                          <strong>{user.name || user.email}</strong>
                          <small>{user.email}</small>
                        </td>
                        <td>
                          <StatusBadge value={user.role} />
                        </td>
                        <td>{user.instance_count}</td>
                        <td>{user.container_count}</td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                    {!users.items.length && (
                      <tr>
                        <td colSpan={5}>사용자가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <PaginationControls pagination={users.pagination} onPageChange={setUserPage} />
              </div>
            </section>

            <section className="admin-table-section">
              <div className="section-head section-head-tight">
                <div>
                  <p className="eyebrow">컴퓨트</p>
                  <h2>컴퓨터</h2>
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
                    {instances.items.map((instance) => (
                      <tr
                        key={instance.id}
                        onClick={() =>
                          navigate(`/admin/instances/${encodeURIComponent(instance.id)}`)
                        }
                      >
                        <td>
                          <strong>{instance.name || instance.id}</strong>
                          <small>{instance.id}</small>
                        </td>
                        <td>
                          <StatusBadge value={instance.status} />
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
                    {!instances.items.length && (
                      <tr>
                        <td colSpan={6}>인스턴스가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <PaginationControls
                  pagination={instances.pagination}
                  onPageChange={setInstancePage}
                />
              </div>
            </section>

            <section className="admin-table-section">
              <div className="section-head section-head-tight">
                <div>
                  <p className="eyebrow">스토리지</p>
                  <h2>스토리지</h2>
                </div>
              </div>
              <div className="table-frame">
                <table className="flavor-table admin-table">
                  <thead>
                    <tr>
                      <th>컨테이너</th>
                      <th>상태</th>
                      <th>소유자</th>
                      <th>OpenStack 이름</th>
                      <th>생성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {containers.items.map((container) => (
                      <tr
                        key={container.id}
                        onClick={() =>
                          navigate(`/admin/containers/${encodeURIComponent(container.id)}`)
                        }
                      >
                        <td>
                          <strong>{container.name}</strong>
                          <small>{container.id}</small>
                        </td>
                        <td>
                          <StatusBadge value={container.status} />
                        </td>
                        <td>
                          <strong>{container.owner_name || container.owner_email || '-'}</strong>
                          <small>{container.owner_email}</small>
                        </td>
                        <td>{container.openstack_name}</td>
                        <td>{formatDate(container.created_at)}</td>
                      </tr>
                    ))}
                    {!containers.items.length && (
                      <tr>
                        <td colSpan={5}>컨테이너가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <PaginationControls
                  pagination={containers.pagination}
                  onPageChange={setContainerPage}
                />
              </div>
            </section>

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
                        <StatusBadge value={status} />
                        <strong>{count}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="muted">인스턴스가 없습니다.</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
