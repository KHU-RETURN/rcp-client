import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchAdminContainer,
  fetchAdminInstance,
  fetchAdminUserResources,
} from '../../services/admin';
import type { AdminContainer, AdminInstance, AdminUserResources } from '../../types';
import { ROUTE_NAMES } from '../../constants';
import { Topbar } from '../layout/Topbar';

type LoadState = 'loading' | 'ready' | 'error';

function formatDate(value: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function statusClass(value: string): string {
  const normalized = value.toLowerCase();
  if (['healthy', 'active', 'ready', 'registered'].includes(normalized)) return 'valid';
  if (['unknown', 'build', 'unconfigured'].includes(normalized)) return 'pending';
  return 'error';
}

function displayStatus(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized === 'healthy') return '정상';
  if (normalized === 'unhealthy') return '장애';
  if (normalized === 'unconfigured') return '미설정';
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

function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-badge ${statusClass(value)}`}>{displayStatus(value)}</span>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-detail-row">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function AdminDetailShell({
  eyebrow,
  title,
  support,
  error,
  children,
}: {
  eyebrow: string;
  title: string;
  support?: string;
  error?: string | null;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="page page-admin shell-enter">
      <Topbar active={ROUTE_NAMES.admin} />
      <main className="workspace admin-workspace">
        <section className="workspace-main admin-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h2>{title}</h2>
                {support && <p className="muted section-support">{support}</p>}
              </div>
              <button type="button" className="ghost-button" onClick={() => navigate('/admin')}>
                대시보드
              </button>
            </div>
            {error && <p className="inline-status error">{error}</p>}
            {children}
          </section>
        </section>
      </main>
    </div>
  );
}

function ResourceGroup({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: Array<{ key: string; name: string; meta: string; status: string; path?: string }>;
}) {
  const navigate = useNavigate();

  return (
    <div className="admin-resource-group">
      <strong>{title}</strong>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.key}>
              {item.path ? (
                <button
                  type="button"
                  className="admin-resource-link"
                  onClick={() => navigate(item.path ?? '')}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.meta}</small>
                  </span>
                  <StatusBadge value={item.status} />
                </button>
              ) : (
                <div className="admin-resource-static">
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.meta}</small>
                  </span>
                  <StatusBadge value={item.status} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{emptyText}</p>
      )}
    </div>
  );
}

export function AdminUserDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<AdminUserResources | null>(null);

  useEffect(() => {
    if (!id) {
      setError('유저 ID가 없습니다.');
      setState('error');
      return;
    }

    let cancelled = false;
    setState('loading');
    setError(null);
    void fetchAdminUserResources(id)
      .then((nextResources) => {
        if (cancelled) return;
        setResources(nextResources);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '유저 리소스를 불러오지 못했습니다.');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const user = resources?.user;

  return (
    <AdminDetailShell
      eyebrow="사용자"
      title={user ? user.name || user.email : '유저 상세'}
      support={user?.email}
      error={error}
    >
      {state === 'loading' ? (
        <p className="muted">유저 리소스를 불러오는 중입니다.</p>
      ) : resources ? (
        <div className="admin-detail-layout">
          <section className="line-block admin-system">
            <div className="line-block-head">
              <div>
                <strong>유저 정보</strong>
                <p className="muted">계정과 소유 리소스 요약</p>
              </div>
              <StatusBadge value={resources.user.role} />
            </div>
            <div className="admin-detail-list">
              <DetailRow label="이메일" value={resources.user.email} />
              <DetailRow label="가입일" value={formatDate(resources.user.created_at)} />
              <DetailRow label="인스턴스" value={`${resources.user.instance_count}개`} />
              <DetailRow label="스토리지" value={`${resources.user.container_count}개`} />
              <DetailRow label="키페어" value={`${resources.user.keypair_count}개`} />
            </div>
          </section>

          <section className="line-block admin-system">
            <div className="line-block-head">
              <div>
                <strong>리소스</strong>
                <p className="muted">컴퓨트와 스토리지는 클릭하면 상세 화면으로 이동합니다.</p>
              </div>
            </div>
            <div className="admin-resource-groups">
              <ResourceGroup
                title="컴퓨트"
                emptyText="소유한 인스턴스가 없습니다."
                items={resources.instances.map((item) => ({
                  key: item.id,
                  name: item.name || item.id,
                  meta: item.flavor_name || item.flavor_id || '-',
                  status: item.status,
                  path: `/admin/instances/${encodeURIComponent(item.id)}`,
                }))}
              />
              <ResourceGroup
                title="스토리지"
                emptyText="소유한 컨테이너가 없습니다."
                items={resources.containers.map((item) => ({
                  key: item.id,
                  name: item.name,
                  meta: item.openstack_name,
                  status: item.status,
                  path: `/admin/containers/${encodeURIComponent(item.id)}`,
                }))}
              />
              <ResourceGroup
                title="키페어"
                emptyText="등록한 키페어가 없습니다."
                items={resources.keypairs.map((item) => ({
                  key: item.id,
                  name: item.name,
                  meta: `연결 인스턴스 ${item.instance_count}개`,
                  status: item.status,
                }))}
              />
            </div>
          </section>
        </div>
      ) : null}
    </AdminDetailShell>
  );
}

export function AdminInstanceDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<AdminInstance | null>(null);

  useEffect(() => {
    if (!id) {
      setError('인스턴스 ID가 없습니다.');
      setState('error');
      return;
    }

    let cancelled = false;
    setState('loading');
    setError(null);
    void fetchAdminInstance(id)
      .then((nextInstance) => {
        if (cancelled) return;
        setInstance(nextInstance);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '인스턴스 상세를 불러오지 못했습니다.');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AdminDetailShell
      eyebrow="컴퓨트"
      title={instance ? instance.name || instance.id : '컴퓨터 상세'}
      support={instance?.id}
      error={error}
    >
      {state === 'loading' ? (
        <p className="muted">인스턴스 상세를 불러오는 중입니다.</p>
      ) : instance ? (
        <section className="line-block admin-system">
          <div className="line-block-head">
            <div>
              <strong>인스턴스 정보</strong>
              <p className="muted">소유자와 생성 상태</p>
            </div>
            <StatusBadge value={instance.status} />
          </div>
          <div className="admin-detail-list">
            <DetailRow label="상태" value={displayStatus(instance.status)} />
            <DetailRow label="소유자" value={instance.owner_name || instance.owner_email} />
            <DetailRow label="이메일" value={instance.owner_email} />
            <DetailRow label="Flavor" value={instance.flavor_name || instance.flavor_id} />
            <DetailRow label="이미지" value={instance.image_id} />
            <DetailRow label="IP" value={instance.fixed_ip} />
            <DetailRow label="생성일" value={formatDate(instance.created_at)} />
            <DetailRow label="수정일" value={formatDate(instance.updated_at)} />
          </div>
        </section>
      ) : null}
    </AdminDetailShell>
  );
}

export function AdminContainerDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<AdminContainer | null>(null);

  useEffect(() => {
    if (!id) {
      setError('컨테이너 ID가 없습니다.');
      setState('error');
      return;
    }

    let cancelled = false;
    setState('loading');
    setError(null);
    void fetchAdminContainer(id)
      .then((nextContainer) => {
        if (cancelled) return;
        setContainer(nextContainer);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '스토리지 상세를 불러오지 못했습니다.');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AdminDetailShell
      eyebrow="스토리지"
      title={container ? container.name : '스토리지 상세'}
      support={container?.openstack_name}
      error={error}
    >
      {state === 'loading' ? (
        <p className="muted">스토리지 상세를 불러오는 중입니다.</p>
      ) : container ? (
        <section className="line-block admin-system">
          <div className="line-block-head">
            <div>
              <strong>컨테이너 정보</strong>
              <p className="muted">소유자와 OpenStack 식별자</p>
            </div>
            <StatusBadge value={container.status} />
          </div>
          <div className="admin-detail-list">
            <DetailRow label="소유자" value={container.owner_name || container.owner_email} />
            <DetailRow label="이메일" value={container.owner_email} />
            <DetailRow label="컨테이너 ID" value={container.id} />
            <DetailRow label="OpenStack 이름" value={container.openstack_name} />
            <DetailRow label="생성일" value={formatDate(container.created_at)} />
            <DetailRow label="수정일" value={formatDate(container.updated_at)} />
          </div>
        </section>
      ) : null}
    </AdminDetailShell>
  );
}
