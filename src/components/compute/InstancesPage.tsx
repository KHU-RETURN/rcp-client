import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { InstanceTable } from './InstanceTable';
import { InlineBadge } from '../shared/InlineBadge';
import { ROUTE_NAMES, imageTemplates, networkTemplates } from '../../constants';
import { getDisplayInstanceId, getTerminalAvailability, getVisibleInstances, statusTone } from '../../utils';
import { humanizeDate } from '../../utils';

export function InstancesPage() {
  const navigate = useNavigate();
  const {
    instances,
    selectedInstanceId,
    instanceQuery,
    instanceStatusFilter,
    setInstanceQuery,
    setInstanceStatusFilter,
    setSelectedInstanceId,
    ensureSelectedInstance,
    ensureInstanceData,
    deleteInstance,
    flavors,
    ensureFlavorData,
  } = useStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  async function handleDeleteInstance(id: string) {
    if (!confirm('정말로 이 인스턴스를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    try {
      setDeletingId(id);
      await deleteInstance(id);
    } catch {
      alert('인스턴스 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDeletingId(null);
    }
  }
  
  useEffect(() => {
    ensureSelectedInstance();
    void ensureInstanceData();
  }, [ensureSelectedInstance, ensureInstanceData]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hasBuild = instances.some((i) => String(i.status).toUpperCase() === 'BUILD');
    if (!hasBuild) return;
    const timer = window.setInterval(() => void ensureInstanceData(), 5000);
    return () => window.clearInterval(timer);
  }, [instances, ensureInstanceData]);

  useEffect(() => {
    void ensureFlavorData();
  }, [ensureFlavorData]);

  const visible = getVisibleInstances(instances, instanceQuery, instanceStatusFilter);

  useEffect(() => {
    if (visible.length && !visible.some((i) => i.id === selectedInstanceId)) {
      setSelectedInstanceId(visible[0]?.id ?? null);
    }
  }, [visible, selectedInstanceId, setSelectedInstanceId]);

  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) ?? null;
  const terminalAvailability = getTerminalAvailability(selectedInstance, now);
  const activeCount = instances.filter((i) => String(i.status).toUpperCase() === 'ACTIVE').length;
  const buildCount = instances.filter((i) => String(i.status).toUpperCase() === 'BUILD').length;
  const errorCount = instances.filter((i) => statusTone(i.status) === 'error').length;

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.instances} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Compute</p>
                <h2>Instances</h2>
                <p className="muted section-support">인스턴스 목록</p>
              </div>
              <div className="section-head-meta">
                <div className="section-stats" aria-label="Inventory summary">
                  <div className="mini-stat">
                    <span>Visible</span>
                    <strong>{visible.length}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Total</span>
                    <strong>{instances.length}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Active</span>
                    <strong>{activeCount}</strong>
                  </div>
                </div>
                <button className="primary-button" onClick={() => navigate('/compute/create')}>
                  Create new VM
                </button>
              </div>
            </div>

            <div className="inventory-toolbar">
              <label className="field inventory-search">
                <span>Search</span>
                <input
                  name="instanceQuery"
                  type="text"
                  placeholder="Search instances"
                  value={instanceQuery}
                  onChange={(e) => setInstanceQuery(e.target.value)}
                />
              </label>
              <div className="toolbar-side">
                <div className="filter-row" aria-label="Instance status filters">
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('all')}
                  >
                    All {instances.length}
                  </button>
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('active')}
                  >
                    Active {activeCount}
                  </button>
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'build' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('build')}
                  >
                    Building {buildCount}
                  </button>
                </div>
                {errorCount > 0 && <span className="toolbar-meta">Issues {errorCount}</span>}
              </div>
            </div>

            <div className="table-frame">
              <InstanceTable />
            </div>
          </section>
        </section>

        <aside className="workspace-summary list-detail">
          <div className="summary-headline summary-headline-compact">
            <div>
              <p className="eyebrow">Instance details</p>
              <h2>{selectedInstance?.name ?? 'No selection'}</h2>
            </div>
            {selectedInstance && (
              <InlineBadge tone={statusTone(selectedInstance.status)} label={selectedInstance.status} />
            )}
          </div>
          {selectedInstance ? (
            <>
              <dl className="summary-grid large">
                <div><dt>ID</dt><dd>{getDisplayInstanceId(selectedInstance.id)}</dd></div>
                <div><dt>Flavor</dt><dd>{selectedInstance.flavorName}</dd></div>
                <div><dt>OS</dt><dd>{imageTemplates.find((t) => t.id === selectedInstance.imageId)?.label ?? selectedInstance.imageId.slice(0, 8)}</dd></div>
                <div><dt>Network</dt><dd>{networkTemplates.find((t) => t.id === selectedInstance.networkId)?.label ?? (selectedInstance.networkId || '—')}</dd></div>
                <div><dt>SSH key</dt><dd>{selectedInstance.keyName || 'Not registered'}</dd></div>
                <div>
                  <dt>Created</dt>
                  <dd>
                    {selectedInstance.created && !selectedInstance.created.startsWith('0001') 
                      ? humanizeDate(selectedInstance.created) 
                      : '—'}
                  </dd>
                </div>
              </dl>
              <div className="summary-note">
                <strong>Note</strong>
                <p>{selectedInstance.note || 'No note'}</p>
              </div>
              <div className="action-row compact sidebar-actions">
                <button
                  className="primary-button"
                  disabled={!terminalAvailability.canOpen}
                  onClick={() => navigate(`/compute/instances/${encodeURIComponent(selectedInstance.id)}/terminal`)}
                >
                  {terminalAvailability.canOpen
                    ? 'Open terminal'
                    : terminalAvailability.waitSeconds > 0
                      ? `Terminal ready in ${terminalAvailability.waitSeconds}s`
                      : 'Terminal unavailable'}
                </button>
                <button
                  className="ghost-button"
                  onClick={() => navigate(`/compute/instances/${encodeURIComponent(selectedInstance.id)}`)}
                >
                  View details
                </button>
                <button
                  className="danger-button"
                  disabled={deletingId === selectedInstance.id}
                  onClick={() => handleDeleteInstance(selectedInstance.id)}
                >
                  {deletingId === selectedInstance.id ? 'Deleting...' : 'Delete instance'}
                </button>
              </div>
            </>
          ) : (
            <p className="muted">표시할 인스턴스가 없습니다.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
