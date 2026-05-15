import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { InlineBadge } from '../shared/InlineBadge';
import { EmptyBlock } from '../shared/EmptyBlock';
import { ROUTE_NAMES } from '../../constants';
import { getDisplayInstanceId, getTerminalAvailability, humanizeDate, statusTone } from '../../utils';

export function InstanceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { instances } = useStore();
  const instance = instances.find((i) => i.id === id) ?? null;
  const [now, setNow] = useState(() => Date.now());
  const terminalAvailability = getTerminalAvailability(instance, now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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
                <button className="ghost-button" onClick={() => navigate('/compute')}>
                  Back to instances
                </button>
              </div>
            </div>

            {instance ? (
              <div className="detail-page-grid">
                <section className="detail-page-main table-frame">
                  <div className="detail-page-header">
                    <div>
                      <p className="eyebrow">Instance</p>
                      <h2>{instance.name}</h2>
                    </div>
                    <InlineBadge tone={statusTone(instance.status)} label={instance.status} />
                  </div>
                  <dl className="summary-grid large detail-grid">
                    <div><dt>ID</dt><dd>{getDisplayInstanceId(instance.id)}</dd></div>
                    <div><dt>Flavor</dt><dd>{instance.flavorId}</dd></div>
                    <div><dt>Image</dt><dd>{instance.imageId}</dd></div>
                    <div><dt>Network</dt><dd>{instance.networkId || 'Not set'}</dd></div>
                    <div><dt>SSH key</dt><dd>{instance.keyName || 'Not registered'}</dd></div>
                    <div><dt>Mode</dt><dd>{instance.mode}</dd></div>
                    <div><dt>Created</dt><dd>{humanizeDate(instance.created)}</dd></div>
                    <div><dt>Updated</dt><dd>{humanizeDate(instance.updated)}</dd></div>
                  </dl>
                </section>

                <aside className="workspace-summary detail-side">
                  <div className="summary-headline">
                    <p className="eyebrow">Actions</p>
                    <h2>{instance.name}</h2>
                  </div>
                  <div className="summary-note">
                    <strong>Note</strong>
                    <p>{instance.note || 'No note'}</p>
                  </div>
                  <div className="action-row compact sidebar-actions">
                    <button
                      className="primary-button"
                      disabled={!terminalAvailability.canOpen}
                      onClick={() => navigate(`/compute/instances/${encodeURIComponent(instance.id)}/terminal`)}
                    >
                      {terminalAvailability.canOpen
                        ? 'Open terminal'
                        : terminalAvailability.waitSeconds > 0
                          ? `Terminal ready in ${terminalAvailability.waitSeconds}s`
                          : 'Terminal unavailable'}
                    </button>
                    <button className="ghost-button" onClick={() => navigate('/compute/create')}>
                      Create VM
                    </button>
                  </div>
                </aside>
              </div>
            ) : (
              <EmptyBlock
                title="인스턴스를 찾을 수 없습니다."
                description="목록으로 돌아가 다른 인스턴스를 선택해 주세요."
              />
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
