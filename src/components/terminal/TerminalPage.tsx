import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { TerminalHost } from './TerminalHost';
import { InstanceSummaryCard } from '../compute/InstanceSummaryCard';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ROUTE_NAMES } from '../../constants';
import { getTerminalAvailability } from '../../utils';

export function TerminalPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { instances } = useStore();
  const instance = instances.find((i) => i.id === id) ?? null;
  const [now, setNow] = useState(() => Date.now());
  const terminalAvailability = getTerminalAvailability(instance, now);

  const shellRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(shellRef);

  const clearRef = useRef<(() => void) | null>(null);
  const reconnectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page page-terminal shell-enter">
      <Topbar active={ROUTE_NAMES.terminal} />
      <main className={`workspace workspace-terminal ${isFullscreen ? 'terminal-fullscreen' : ''}`}>
        <section className="workspace-main terminal-main">
          <div ref={shellRef} className={`terminal-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
            <div className="terminal-shell-head">
              <div className="terminal-heading">
                <div className="terminal-breadcrumb">
                  <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => navigate('/compute')}
                  >
                    Compute
                  </button>
                  <span>/</span>
                  <button
                    type="button"
                    className="breadcrumb-link"
                    onClick={() => navigate('/compute')}
                  >
                    Instances
                  </button>
                  <span>/</span>
                  <strong>{instance?.name ?? 'Unknown instance'}</strong>
                </div>
                <h2>{instance?.name ?? 'Unknown instance'}</h2>
              </div>
              <div className="action-row compact">
                <button type="button" className="ghost-button" onClick={toggleFullscreen}>
                  {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
                <button type="button" className="ghost-button" onClick={() => clearRef.current?.()}>
                  Clear
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={!terminalAvailability.canOpen}
                  onClick={() => reconnectRef.current?.()}
                >
                  Reconnect
                </button>
                <button type="button" className="ghost-button" onClick={() => navigate('/compute')}>
                  Back to list
                </button>
              </div>
            </div>
            {instance && terminalAvailability.canOpen ? (
              <TerminalHost
                instance={instance}
                onClearRef={clearRef}
                onReconnectRef={reconnectRef}
              />
            ) : instance ? (
              <div className="terminal-host terminal-waiting" data-ui="terminal-waiting">
                <p>
                  {terminalAvailability.waitSeconds > 0
                    ? `Terminal will be available in ${terminalAvailability.waitSeconds}s.`
                    : `${terminalAvailability.reason}.`}
                </p>
              </div>
            ) : (
              <p className="muted">선택한 인스턴스를 찾을 수 없습니다.</p>
            )}
          </div>
        </section>

        <InstanceSummaryCard
          instance={instance}
          emptyMessage="선택한 인스턴스를 찾을 수 없습니다."
          actions={
            instance && (
              <>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => navigate(`/compute/instances/${encodeURIComponent(instance.id)}`)}
                >
                  View details
                </button>
                <button type="button" className="ghost-button" onClick={() => navigate('/compute')}>
                  Back to instances
                </button>
              </>
            )
          }
        />
      </main>
    </div>
  );
}
