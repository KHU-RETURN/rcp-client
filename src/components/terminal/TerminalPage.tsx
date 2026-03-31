import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { TerminalHost } from './TerminalHost';
import { InlineBadge } from '../shared/InlineBadge';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ROUTE_NAMES } from '../../constants';
import { statusTone, getDisplayInstanceId } from '../../utils';

export function TerminalPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { instances } = useStore();
  const instance = instances.find((i) => i.id === id) ?? null;

  const shellRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(shellRef);

  const clearRef = useRef<(() => void) | null>(null);
  const reconnectRef = useRef<(() => void) | null>(null);

  return (
    <div className="page page-terminal shell-enter">
      <Topbar active={ROUTE_NAMES.terminal} />
      <main className={`workspace workspace-terminal ${isFullscreen ? 'terminal-fullscreen' : ''}`}>
        <section className="workspace-main terminal-main">
          <div
            ref={shellRef}
            className={`terminal-shell ${isFullscreen ? 'is-fullscreen' : ''}`}
          >
            <div className="terminal-shell-head">
              <div className="terminal-heading">
                <div className="terminal-breadcrumb">
                  <button className="breadcrumb-link" onClick={() => navigate('/compute')}>
                    Compute
                  </button>
                  <span>/</span>
                  <button className="breadcrumb-link" onClick={() => navigate('/compute')}>
                    Instances
                  </button>
                  <span>/</span>
                  <strong>{instance?.name ?? 'Unknown instance'}</strong>
                </div>
                <h2>{instance?.name ?? 'Unknown instance'}</h2>
              </div>
              <div className="action-row compact">
                <button className="ghost-button" onClick={toggleFullscreen}>
                  {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
                <button className="ghost-button" onClick={() => clearRef.current?.()}>
                  Clear
                </button>
                <button className="ghost-button" onClick={() => reconnectRef.current?.()}>
                  Reconnect
                </button>
                <button className="ghost-button" onClick={() => navigate('/compute')}>
                  Back to list
                </button>
              </div>
            </div>
            {instance ? (
              <TerminalHost
                instance={instance}
                onClearRef={clearRef}
                onReconnectRef={reconnectRef}
              />
            ) : (
              <p className="muted">선택한 인스턴스를 찾을 수 없습니다.</p>
            )}
          </div>
        </section>

        <aside className="workspace-summary terminal-detail">
          <div className="summary-headline">
            <p className="eyebrow">Instance</p>
            <h2>{instance?.name ?? 'No instance'}</h2>
          </div>
          {instance ? (
            <>
              <dl className="summary-grid large">
                <div><dt>ID</dt><dd>{getDisplayInstanceId(instance.id)}</dd></div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <InlineBadge tone={statusTone(instance.status)} label={instance.status} />
                  </dd>
                </div>
                <div><dt>Flavor</dt><dd>{instance.flavorId}</dd></div>
                <div><dt>Network</dt><dd>{instance.networkId || 'Not set'}</dd></div>
                <div><dt>SSH key</dt><dd>{instance.keyName || 'Not set'}</dd></div>
              </dl>
              <div className="summary-note">
                <strong>Access</strong>
                <p>Browser terminal</p>
              </div>
              <div className="command-list">
                <strong>Commands</strong>
                <ul>
                  <li><code>help</code></li>
                  <li><code>cat instance.txt</code></li>
                  <li><code>ip addr</code></li>
                  <li><code>uptime</code></li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted">선택한 인스턴스를 찾을 수 없습니다.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
