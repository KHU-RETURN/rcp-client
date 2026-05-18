import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { InlineBadge } from '../shared/InlineBadge';
import { EmptyBlock } from '../shared/EmptyBlock';
import { ROUTE_NAMES, imageTemplates } from '../../constants';
import {
  formatCpuUsage,
  formatRam,
  getTerminalAvailability,
  humanizeDate,
  statusTone,
} from '../../utils';
import type { Instance } from '../../types';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

const POLL_INTERVAL_MS = 5000;

function getImageLabel(imageId: string): string {
  if (!imageId) return '-';
  return imageTemplates.find((t) => t.id === imageId)?.label ?? imageId;
}

function getFlavorLabel(instance: Instance): string {
  const name = instance.flavorName || instance.flavorId || '-';
  const parts: string[] = [];
  if (instance.vcpus !== undefined) parts.push(`${instance.vcpus} vCPU`);
  if (instance.ram !== undefined) parts.push(formatRam(instance.ram));
  if (instance.disk !== undefined) parts.push(`${instance.disk} GiB disk`);
  return parts.length ? `${name} · ${parts.join(' · ')}` : name;
}

function getMemoryUsageLabel(instance: Instance): string {
  if (!instance.memoryUsage) return '—';
  return formatRam(instance.memoryUsage);
}

export function InstanceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { instances, ensureInstanceById } = useStore();
  const instance = instances.find((i) => i.id === id) ?? null;
  const [now, setNow] = useState(() => Date.now());
  const [loadState, setLoadState] = useState<LoadState>(instance ? 'ready' : 'loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalAvailability = getTerminalAvailability(instance, now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    if (!instance) setLoadState('loading');

    void (async () => {
      const result = await ensureInstanceById(id);
      if (cancelled) return;
      if (result === 'not-found') setLoadState('not-found');
      else if (result === 'error') setLoadState('error');
      else setLoadState('ready');
    })();

    return () => { cancelled = true; };
  }, [id, ensureInstanceById]);

  useEffect(() => {
    if (!id || !instance) return;
    if (String(instance.status).toUpperCase() !== 'BUILD') return;

    const interval = window.setInterval(() => {
      void ensureInstanceById(id);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [id, instance, ensureInstanceById]);

  async function handleRefresh() {
    if (!id || isRefreshing) return;
    setIsRefreshing(true);
    const result = await ensureInstanceById(id);
    if (result === 'not-found') setLoadState('not-found');
    else if (result === 'error') setLoadState('error');
    else setLoadState('ready');
    setIsRefreshing(false);
  }

  async function handleCopyId() {
    if (!instance) return;
    try {
      await navigator.clipboard.writeText(instance.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.detail} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Compute</p>
                <h2>Instance details</h2>
                <p className="muted section-support">선택한 인스턴스의 속성과 접근 정보를 확인합니다.</p>
              </div>
              <div className="action-row compact">
                <button
                  className="ghost-button"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing || !id}
                >
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
                <button className="ghost-button" onClick={() => navigate('/compute')}>
                  Back to instances
                </button>
              </div>
            </div>

            {instance ? (
              <article className="instance-card table-frame">
                <header className="instance-card-head">
                  <div className="instance-identity">
                    <div className="instance-identity-top">
                      <p className="eyebrow">Instance</p>
                      <InlineBadge tone={statusTone(instance.status)} label={instance.status} />
                    </div>
                    <h3>{instance.name}</h3>
                    <div className="instance-id-row">
                      <code>{instance.id}</code>
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => void handleCopyId()}
                        aria-label="Copy instance ID"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="instance-head-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      disabled
                      title="Coming soon"
                    >
                      Edit
                    </button>
                    <button
                      className="primary-button instance-cta"
                      disabled={!terminalAvailability.canOpen}
                      onClick={() => navigate(`/compute/instances/${encodeURIComponent(instance.id)}/terminal`)}
                    >
                      {terminalAvailability.canOpen
                        ? 'Open terminal'
                        : terminalAvailability.waitSeconds > 0
                          ? `Terminal ready in ${terminalAvailability.waitSeconds}s`
                          : 'Terminal unavailable'}
                    </button>
                  </div>
                </header>

                <div className="instance-grid">
                  <section className="instance-block">
                    <p className="eyebrow">Connect</p>
                    <dl className="instance-property-rows">
                      <div>
                        <dt>Fixed IP</dt>
                        <dd>{instance.fixedIp || '—'}</dd>
                      </div>
                      <div>
                        <dt>SSH key</dt>
                        <dd>{instance.keyName || 'Not registered'}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="instance-block">
                    <p className="eyebrow">Configuration</p>
                    <dl className="instance-property-rows">
                      <div>
                        <dt>Flavor</dt>
                        <dd>{getFlavorLabel(instance)}</dd>
                      </div>
                      <div>
                        <dt>Image</dt>
                        <dd>{getImageLabel(instance.imageId)}</dd>
                      </div>
                      <div>
                        <dt>Created</dt>
                        <dd>{humanizeDate(instance.created)}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="instance-block">
                    <p className="eyebrow">Runtime</p>
                    <dl className="instance-property-rows">
                      <div>
                        <dt>CPU time</dt>
                        <dd>{formatCpuUsage(instance.cpuUsage)}</dd>
                      </div>
                      <div>
                        <dt>Memory</dt>
                        <dd>{getMemoryUsageLabel(instance)}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                {instance.note && (
                  <div className="instance-note">
                    <strong>Note</strong>
                    <p>{instance.note}</p>
                  </div>
                )}

                {String(instance.status).toUpperCase() === 'BUILD' && (
                  <p className="muted instance-build-hint">상태가 변하면 자동으로 갱신됩니다.</p>
                )}
              </article>
            ) : loadState === 'loading' ? (
              <EmptyBlock
                title="인스턴스를 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            ) : loadState === 'not-found' ? (
              <EmptyBlock
                title="인스턴스를 찾을 수 없습니다."
                description="목록으로 돌아가 다른 인스턴스를 선택해 주세요."
              />
            ) : (
              <EmptyBlock
                title="인스턴스를 불러오지 못했습니다."
                description="잠시 후 Refresh 버튼으로 다시 시도해 주세요."
              />
            )}

          </section>
        </section>

        {instance && instances.filter((i) => i.id !== instance.id).length > 0 && (
          <aside className="workspace-summary instance-siblings">
            <p className="eyebrow">Other instances</p>
            <ul className="instance-siblings-list">
              {instances
                .filter((i) => i.id !== instance.id)
                .map((sibling) => (
                  <li key={sibling.id}>
                    <button
                      type="button"
                      className="instance-sibling-card"
                      onClick={() => navigate(`/compute/instances/${encodeURIComponent(sibling.id)}`)}
                    >
                      <InlineBadge tone={statusTone(sibling.status)} label={sibling.status} />
                      <span className="instance-sibling-name">{sibling.name}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </aside>
        )}
      </main>
    </div>
  );
}
