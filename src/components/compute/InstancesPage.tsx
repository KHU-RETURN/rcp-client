import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { InstanceTable } from './InstanceTable';
import { InstanceSummaryCard } from './InstanceSummaryCard';
import { ROUTE_NAMES } from '../../constants';
import { getTerminalAvailability, getVisibleInstances, statusTone } from '../../utils';

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
    pauseInstance,
    unpauseInstance,
  } = useStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [powerActionId, setPowerActionId] = useState<string | null>(null);
  const [powerActionError, setPowerActionError] = useState<string | null>(null);
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

  async function handlePowerAction(id: string, status: string) {
    setPowerActionError(null);
    try {
      setPowerActionId(id);
      if (String(status).toUpperCase() === 'PAUSED') {
        await unpauseInstance(id);
      } else {
        await pauseInstance(id);
      }
    } catch {
      setPowerActionError('Instance power action failed. Please try again.');
    } finally {
      setPowerActionId(null);
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

  const visible = getVisibleInstances(instances, instanceQuery, instanceStatusFilter);

  useEffect(() => {
    if (visible.length && !visible.some((i) => i.id === selectedInstanceId)) {
      setSelectedInstanceId(visible[0]?.id ?? null);
    }
  }, [visible, selectedInstanceId, setSelectedInstanceId]);

  const selectedInstance = instances.find((i) => i.id === selectedInstanceId) ?? null;
  const terminalAvailability = getTerminalAvailability(selectedInstance, now);
  const activeCount = instances.filter((i) => String(i.status).toUpperCase() === 'ACTIVE').length;
  const pauseCount = instances.filter((i) => String(i.status).toUpperCase() === 'PAUSED').length;
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
                <div className="section-stats" role="group" aria-label="Inventory summary">
                  <div className="mini-stat">
                    <span>VISIBLE</span>
                    <strong>{visible.length}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>TOTAL</span>
                    <strong>{instances.length}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>ACTIVE</span>
                    <strong>{activeCount}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>PAUSE</span>
                    <strong>{pauseCount}</strong>
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
                <div className="filter-row" role="group" aria-label="Instance status filters">
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('all')}
                  >
                    ALL {instances.length}
                  </button>
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('active')}
                  >
                    ACTIVE {activeCount}
                  </button>
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'paused' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('paused')}
                  >
                    PAUSE {pauseCount}
                  </button>
                  <button
                    className={`filter-chip ${instanceStatusFilter === 'build' ? 'active' : ''}`}
                    onClick={() => setInstanceStatusFilter('build')}
                  >
                    BUILDING {buildCount}
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

        <InstanceSummaryCard
          instance={selectedInstance}
          actions={
            selectedInstance && (
              <>
                <button
                  className="primary-button"
                  disabled={!terminalAvailability.canOpen}
                  onClick={() =>
                    navigate(
                      `/compute/instances/${encodeURIComponent(selectedInstance.id)}/terminal`,
                    )
                  }
                >
                  {terminalAvailability.canOpen
                    ? 'Open terminal'
                    : terminalAvailability.waitSeconds > 0
                      ? `Terminal ready in ${terminalAvailability.waitSeconds}s`
                      : 'Terminal unavailable'}
                </button>
                <button
                  className="ghost-button"
                  onClick={() =>
                    navigate(`/compute/instances/${encodeURIComponent(selectedInstance.id)}`)
                  }
                >
                  View details & Edit
                </button>
                <button
                  className="ghost-button"
                  disabled={
                    powerActionId === selectedInstance.id ||
                    !['ACTIVE', 'PAUSED'].includes(String(selectedInstance.status).toUpperCase())
                  }
                  onClick={() => handlePowerAction(selectedInstance.id, selectedInstance.status)}
                >
                  {powerActionId === selectedInstance.id
                    ? 'Working...'
                    : String(selectedInstance.status).toUpperCase() === 'PAUSED'
                      ? 'Resume'
                      : 'Pause'}
                </button>
                {powerActionError && <p className="inline-status error">{powerActionError}</p>}
                <button
                  className="danger-button"
                  disabled={
                    deletingId === selectedInstance.id || powerActionId === selectedInstance.id
                  }
                  onClick={() => handleDeleteInstance(selectedInstance.id)}
                >
                  {deletingId === selectedInstance.id ? 'Deleting...' : 'Delete instance'}
                </button>
              </>
            )
          }
        />
      </main>
    </div>
  );
}
