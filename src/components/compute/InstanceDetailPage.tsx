import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { deleteInstanceApp, registerInstanceApp } from '../../services/compute';
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
  translateError,
} from '../../utils';
import type { Instance } from '../../types';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';
type AppRegistrationState = 'idle' | 'saving' | 'saved' | 'error';

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

function getAppHostUrl(host: string): string {
  return host.startsWith('http://') || host.startsWith('https://') ? host : `https://${host}`;
}

export function InstanceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { instances, ensureInstanceById, pauseInstance, unpauseInstance } = useStore();
  const instance = instances.find((i) => i.id === id) ?? null;
  const [now, setNow] = useState(() => Date.now());
  const [loadState, setLoadState] = useState<LoadState>(instance ? 'ready' : 'loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPowerActionRunning, setIsPowerActionRunning] = useState(false);
  const [powerActionError, setPowerActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [appSubdomain, setAppSubdomain] = useState('');
  const [appStatus, setAppStatus] = useState<{
    state: AppRegistrationState;
    message: string;
  }>({ state: 'idle', message: '' });
  const terminalAvailability = getTerminalAvailability(instance, now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!id) return;
    setAppSubdomain('');
    setAppStatus({ state: 'idle', message: '' });
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

  async function handlePowerAction() {
    if (!instance || isPowerActionRunning) return;
    setPowerActionError(null);
    try {
      setIsPowerActionRunning(true);
      if (String(instance.status).toUpperCase() === 'PAUSED') {
        await unpauseInstance(instance.id);
      } else {
        await pauseInstance(instance.id);
      }
    } catch {
      setPowerActionError('Instance power action failed. Please try again.');
    } finally {
      setIsPowerActionRunning(false);
    }
  }

  async function handleRegisterApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instance || appStatus.state === 'saving') return;

    const subdomain = appSubdomain.trim();
    if (!subdomain) {
      setAppStatus({ state: 'error', message: '서브도메인을 입력해 주세요.' });
      return;
    }

    setAppStatus({ state: 'saving', message: '앱 등록 요청을 보내는 중입니다.' });

    try {
      await registerInstanceApp(instance.id, { subdomain });
      await ensureInstanceById(instance.id);
      setAppSubdomain('');
      setAppStatus({
        state: 'saved',
        message: '등록되었습니다.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAppStatus({ state: 'error', message: translateError(message) });
    }
  }

  async function handleDeleteApp() {
    if (!instance || appStatus.state === 'saving') return;

    setAppStatus({ state: 'saving', message: '앱 등록을 삭제하는 중입니다.' });

    try {
      await deleteInstanceApp(instance.id);
      await ensureInstanceById(instance.id);
      setAppStatus({ state: 'saved', message: '삭제되었습니다.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAppStatus({ state: 'error', message: translateError(message) });
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
                      disabled={
                        isPowerActionRunning ||
                        !['ACTIVE', 'PAUSED'].includes(String(instance.status).toUpperCase())
                      }
                      onClick={() => void handlePowerAction()}
                    >
                      {isPowerActionRunning
                        ? 'Working...'
                        : String(instance.status).toUpperCase() === 'PAUSED'
                          ? 'Resume'
                          : 'Pause'}
                    </button>
                    {powerActionError && <p className="inline-status error">{powerActionError}</p>}
                    <button type="button" className="ghost-button" disabled title="Coming soon">
                      Edit
                    </button>
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

                {instance.app ? (
                  <section className="instance-app-form instance-app-registered">
                    <div className="instance-app-copy">
                      <p className="eyebrow">App routing</p>
                      <h4>Registered app</h4>
                      <p className="muted">VM 서비스 바로가기입니다.</p>
                    </div>
                    <dl className="instance-app-meta">
                      <div>
                        <dt>Host</dt>
                        <dd>
                          <a
                            className="instance-app-link"
                            href={getAppHostUrl(instance.app.host)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {instance.app.host}
                          </a>
                        </dd>
                      </div>
                    </dl>
                    <div className="instance-app-actions">
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDeleteApp()}
                        disabled={appStatus.state === 'saving'}
                      >
                        {appStatus.state === 'saving' ? 'Deleting…' : 'Delete app'}
                      </button>
                      {appStatus.message && (
                        <p className={`inline-status ${appStatus.state}`}>{appStatus.message}</p>
                      )}
                    </div>
                  </section>
                ) : (
                  <form
                    className="instance-app-form"
                    onSubmit={(event) => void handleRegisterApp(event)}
                  >
                    <div className="instance-app-copy">
                      <p className="eyebrow">App routing</p>
                      <h4>Register app</h4>
                      <p className="muted">
                        서브도메인을 등록하면 VM에서 실행 중인 앱을 외부 도메인으로 연결합니다.
                      </p>
                    </div>
                    <label className="field instance-app-field">
                      <span>Subdomain</span>
                      <input
                        type="text"
                        value={appSubdomain}
                        onChange={(event) => {
                          setAppSubdomain(event.target.value);
                          if (appStatus.state !== 'idle') {
                            setAppStatus({ state: 'idle', message: '' });
                          }
                        }}
                        placeholder="return"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </label>
                    <div className="instance-app-actions">
                      <button
                        type="submit"
                        className="primary-button"
                        disabled={appStatus.state === 'saving'}
                      >
                        {appStatus.state === 'saving' ? 'Registering…' : 'Register app'}
                      </button>
                      {appStatus.message && (
                        <p className={`inline-status ${appStatus.state}`}>{appStatus.message}</p>
                      )}
                    </div>
                  </form>
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
