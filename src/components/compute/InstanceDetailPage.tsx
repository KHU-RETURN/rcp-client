import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { InlineBadge } from '../shared/InlineBadge';
import { EmptyBlock } from '../shared/EmptyBlock';
import { ROUTE_NAMES, imageTemplates } from '../../constants';
import { formatRam, getTerminalAvailability, humanizeDate, statusTone } from '../../utils';
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
  const { instances, ensureInstanceById, setInstancePaused, updateInstanceDetails } = useStore();
  const instance = instances.find((i) => i.id === id) ?? null;
  const [now, setNow] = useState(() => Date.now());
  const [loadState, setLoadState] = useState<LoadState>(instance ? 'ready' : 'loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  const [form, setForm] = useState({ name: '', keyName: '', note: '' });
  const [actionError, setActionError] = useState('');
  const terminalAvailability = getTerminalAvailability(instance, now);
  const status = String(instance?.status ?? '').toUpperCase();
  const isPaused = status === 'PAUSED';

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!instance || isEditing) return;
    setForm({
      name: instance.name,
      keyName: instance.keyName,
      note: instance.note,
    });
  }, [instance, isEditing]);

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

    return () => {
      cancelled = true;
    };
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
    setActionError('');
    const result = await ensureInstanceById(id);
    if (result === 'not-found') setLoadState('not-found');
    else if (result === 'error') setLoadState('error');
    else setLoadState('ready');
    setIsRefreshing(false);
  }

  async function handleSave() {
    if (!instance || isSaving) return;
    setIsSaving(true);
    setActionError('');
    const result = await updateInstanceDetails(instance.id, {
      name: form.name.trim(),
      key_name: form.keyName.trim(),
      note: form.note.trim(),
    });
    setIsSaving(false);
    if (!result.ok) {
      setActionError(result.error ?? '변경사항을 저장하지 못했습니다.');
      return;
    }
    setIsEditing(false);
  }

  async function handlePauseToggle() {
    if (!instance || isPausing) return;
    setIsPausing(true);
    setActionError('');
    const result = await setInstancePaused(instance.id, !isPaused);
    setIsPausing(false);
    if (!result.ok) {
      setActionError(result.error ?? '상태 변경 요청을 완료하지 못했습니다.');
    }
  }

  async function handleCopy(text: string, type: 'id' | 'ip') {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        window.setTimeout(() => setCopiedId(false), 1400);
      } else {
        setCopiedIp(true);
        window.setTimeout(() => setCopiedIp(false), 1400);
      }
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
                <p className="muted section-support">
                  선택한 인스턴스의 속성과 접근 정보를 확인합니다.
                </p>
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
                    {isEditing ? (
                      <label className="field instance-edit-name">
                        <span>Instance name</span>
                        <input
                          value={form.name}
                          onChange={(event) => setForm({ ...form, name: event.target.value })}
                        />
                      </label>
                    ) : (
                      <h3>{instance.name}</h3>
                    )}
                    <div className="instance-id-row">
                      <code>{instance.id}</code>
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => void handleCopy(instance.id, 'id')}
                        aria-label="Copy instance ID"
                        title={instance.id}
                      >
                        {copiedId ? 'Copied ID' : 'Copy ID'}
                      </button>
                    </div>
                  </div>
                  <div className="instance-head-actions">
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => void handlePauseToggle()}
                      disabled={isPausing || !['ACTIVE', 'PAUSED'].includes(status)}
                    >
                      {isPausing ? 'Sending...' : isPaused ? 'Resume' : 'Pause'}
                    </button>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => {
                            setActionError('');
                            setIsEditing(false);
                            setForm({
                              name: instance.name,
                              keyName: instance.keyName,
                              note: instance.note,
                            });
                          }}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => void handleSave()}
                          disabled={isSaving || form.name.trim().length === 0}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          setActionError('');
                          setIsEditing(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="primary-button instance-cta"
                      disabled={!terminalAvailability.canOpen}
                      onClick={() =>
                        navigate(`/compute/instances/${encodeURIComponent(instance.id)}/terminal`)
                      }
                    >
                      {terminalAvailability.canOpen
                        ? 'Open terminal'
                        : terminalAvailability.waitSeconds > 0
                          ? `Terminal ready in ${terminalAvailability.waitSeconds}s`
                          : 'Terminal unavailable'}
                    </button>
                  </div>
                </header>

                {actionError && <p className="inline-status error">{actionError}</p>}

                <div className="instance-grid">
                  <section className="instance-block">
                    <p className="eyebrow">Connect</p>
                    <dl className="instance-property-rows">
                      <div>
                        <dt>Fixed IP</dt>
                        <dd className="property-action-row">
                          <span>{instance.fixedIp || '—'}</span>
                          {instance.fixedIp && (
                            <button
                              type="button"
                              className="copy-button copy-button-mini"
                              onClick={() => void handleCopy(instance.fixedIp!, 'ip')}
                              aria-label="Copy IP address"
                            >
                              {copiedIp ? 'Copied' : 'Copy'}
                            </button>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>SSH key</dt>
                        <dd>
                          {isEditing ? (
                            <input
                              className="instance-inline-input"
                              value={form.keyName}
                              placeholder="Not registered"
                              onChange={(event) =>
                                setForm({ ...form, keyName: event.target.value })
                              }
                            />
                          ) : (
                            instance.keyName || 'Not registered'
                          )}
                        </dd>
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
                        <dt>Memory</dt>
                        <dd>{getMemoryUsageLabel(instance)}</dd>
                      </div>
                      <div>
                        <dt>CPU (Mock)</dt>
                        <dd>
                          <div className="property-action-row">
                            <div className="metric-bar-track">
                              <div className="metric-bar-fill" style={{ width: '15%' }} />
                            </div>
                            <span className="metric-value">15%</span>
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt>Uptime (Mock)</dt>
                        <dd>12d 4h 23m</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                {isEditing ? (
                  <label className="field instance-note-editor">
                    <span>Note</span>
                    <textarea
                      rows={3}
                      value={form.note}
                      placeholder="인스턴스 메모를 입력하세요."
                      onChange={(event) => setForm({ ...form, note: event.target.value })}
                    />
                  </label>
                ) : instance.note ? (
                  <div className="instance-note">
                    <strong>Note</strong>
                    <p>{instance.note}</p>
                  </div>
                ) : null}

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
                      onClick={() =>
                        navigate(`/compute/instances/${encodeURIComponent(sibling.id)}`)
                      }
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
