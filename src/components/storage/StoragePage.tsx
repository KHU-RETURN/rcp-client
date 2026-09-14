import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { ROUTE_NAMES } from '../../constants';
import { humanizeDate } from '../../utils';
import {
  attachVolume,
  createSnapshot,
  createVolume,
  deleteSnapshot,
  deleteVolume,
  detachVolume,
  fetchSnapshots,
  fetchVolumes,
} from '../../services/block-storage';
import { fetchInstances } from '../../services/compute';
import type { BlockSnapshot, BlockVolume, Instance } from '../../types';

type StorageMode = 'object' | 'block';

const volumeStatuses = new Set(['creating', 'attaching', 'detaching', 'deleting']);

export function StoragePage() {
  const navigate = useNavigate();
  const {
    containers,
    containersStatus,
    containersError,
    selectedContainerName,
    containerCreation,
    ensureContainers,
    setSelectedContainerName,
    createNewContainer,
    removeContainer,
  } = useStore();

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<StorageMode>('object');
  const [createOpen, setCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [createError, setCreateError] = useState('');
  const [busy, setBusy] = useState(false);
  const [volumes, setVolumes] = useState<BlockVolume[]>([]);
  const [snapshots, setSnapshots] = useState<BlockSnapshot[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | null>(null);
  const [volumeDraft, setVolumeDraft] = useState({
    name: '',
    description: '',
    sizeGiB: 10,
    snapshotId: '',
  });
  const [snapshotDraft, setSnapshotDraft] = useState({ name: '', description: '' });
  const [attachInstanceId, setAttachInstanceId] = useState('');

  useEffect(() => {
    void ensureContainers();
  }, [ensureContainers]);

  const refreshBlockStorage = useCallback(async () => {
    setBlockLoading(true);
    setBlockError('');
    try {
      const [nextVolumes, nextSnapshots, nextInstances] = await Promise.all([
        fetchVolumes(),
        fetchSnapshots(),
        fetchInstances(),
      ]);
      setVolumes(nextVolumes);
      setSnapshots(nextSnapshots);
      setInstances(nextInstances);
      setSelectedVolumeId((current) => current ?? nextVolumes[0]?.id ?? null);
    } catch (error) {
      setBlockError(
        error instanceof Error ? error.message : 'Block Storage 정보를 불러오지 못했습니다.',
      );
    } finally {
      setBlockLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== 'block') return;
    void refreshBlockStorage();
  }, [mode, refreshBlockStorage]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return containers;
    return containers.filter((c) => c.name.toLowerCase().includes(q));
  }, [containers, query]);

  useEffect(() => {
    if (visible.length && !visible.some((c) => c.name === selectedContainerName)) {
      setSelectedContainerName(visible[0]?.name ?? null);
    }
  }, [visible, selectedContainerName, setSelectedContainerName]);

  const selected = containers.find((c) => c.name === selectedContainerName) ?? null;
  const selectedVolume = volumes.find((v) => v.id === selectedVolumeId) ?? null;
  const blockVisible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return volumes;
    return volumes.filter(
      (volume) =>
        volume.name.toLowerCase().includes(q) ||
        volume.description.toLowerCase().includes(q) ||
        volume.status.toLowerCase().includes(q),
    );
  }, [volumes, query]);

  useEffect(() => {
    if (mode !== 'block') return;
    if (blockVisible.length && !blockVisible.some((v) => v.id === selectedVolumeId)) {
      setSelectedVolumeId(blockVisible[0]?.id ?? null);
    }
  }, [blockVisible, mode, selectedVolumeId]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreateError('');
    const result = await createNewContainer(draftName);
    if (result.ok) {
      setDraftName('');
      setCreateOpen(false);
    } else {
      setCreateError(result.error ?? '컨테이너를 만들지 못했습니다.');
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`'${name}' 컨테이너를 삭제할까요?`)) return;
    setBusy(true);
    try {
      const result = await removeContainer(name);
      if (result.state === 'not-empty') {
        const force = confirm(
          `'${name}' 컨테이너에 파일이 남아 있습니다. 내부 객체를 모두 함께 삭제할까요?`,
        );
        if (!force) return;
        const forced = await removeContainer(name, true);
        if (forced.state === 'error') {
          alert(forced.message);
        }
      } else if (result.state === 'error') {
        alert(result.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateVolume(event: React.FormEvent) {
    event.preventDefault();
    setCreateError('');
    try {
      const created = await createVolume({
        name: volumeDraft.name,
        description: volumeDraft.description,
        sizeGiB: volumeDraft.sizeGiB,
        snapshotId: volumeDraft.snapshotId || undefined,
      });
      setVolumes((current) => [created, ...current]);
      setSelectedVolumeId(created.id);
      setVolumeDraft({ name: '', description: '', sizeGiB: 10, snapshotId: '' });
      setCreateOpen(false);
      void refreshBlockStorage();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Volume을 만들지 못했습니다.');
    }
  }

  async function handleDeleteVolume(volume: BlockVolume) {
    if (!confirm(`'${volume.name}' Volume을 삭제할까요?`)) return;
    setBusy(true);
    try {
      await deleteVolume(volume.id);
      await refreshBlockStorage();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Volume을 삭제하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAttachVolume(volume: BlockVolume) {
    if (!attachInstanceId) return;
    setBusy(true);
    try {
      await attachVolume(volume.id, attachInstanceId);
      await refreshBlockStorage();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Volume을 연결하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDetachVolume(volume: BlockVolume, instanceId: string) {
    if (!confirm(`'${volume.name}' Volume을 분리할까요?`)) return;
    setBusy(true);
    try {
      await detachVolume(volume.id, instanceId);
      await refreshBlockStorage();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Volume을 분리하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateSnapshot(volume: BlockVolume) {
    if (!snapshotDraft.name.trim()) return;
    setBusy(true);
    try {
      await createSnapshot(volume.id, snapshotDraft);
      setSnapshotDraft({ name: '', description: '' });
      await refreshBlockStorage();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Snapshot을 만들지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSnapshot(snapshot: BlockSnapshot) {
    if (!confirm(`'${snapshot.name}' Snapshot을 삭제할까요?`)) return;
    setBusy(true);
    try {
      await deleteSnapshot(snapshot.id);
      await refreshBlockStorage();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Snapshot을 삭제하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  const isLoading = containersStatus === 'loading' || containersStatus === 'idle';
  const selectedSnapshots = selectedVolume
    ? snapshots.filter((snapshot) => snapshot.volumeId === selectedVolume.id)
    : [];
  const canAttach = selectedVolume?.status === 'available';
  const canSnapshot = selectedVolume?.status === 'available';
  const canDeleteVolume = selectedVolume?.status === 'available';

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.storage} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Storage</p>
                <h2>{mode === 'object' ? 'Object Storage' : 'Block Storage'}</h2>
                <p className="muted section-support">컨테이너 단위로 파일을 보관합니다.</p>
              </div>
              <div className="section-head-meta">
                <fieldset className="section-stats">
                  <legend className="visually-hidden">Storage summary</legend>
                  <div className="mini-stat">
                    <span>Visible</span>
                    <strong>{mode === 'object' ? visible.length : blockVisible.length}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Total</span>
                    <strong>{mode === 'object' ? containers.length : volumes.length}</strong>
                  </div>
                </fieldset>
                <div className="action-row compact">
                  <button
                    type="button"
                    className={mode === 'object' ? 'primary-button' : 'ghost-button'}
                    onClick={() => setMode('object')}
                  >
                    Object
                  </button>
                  <button
                    type="button"
                    className={mode === 'block' ? 'primary-button' : 'ghost-button'}
                    onClick={() => setMode('block')}
                  >
                    Block
                  </button>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setCreateOpen((v) => !v)}
                >
                  {createOpen ? 'Cancel' : mode === 'object' ? 'New container' : 'New volume'}
                </button>
              </div>
            </div>

            {createOpen && mode === 'object' && (
              <form className="inline-create-form" onSubmit={handleCreate}>
                <label className="field">
                  <span>Container name</span>
                  <input
                    name="containerName"
                    type="text"
                    placeholder="my-photos"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    required
                  />
                </label>
                <div className="action-row compact">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={containerCreation.state === 'saving'}
                  >
                    {containerCreation.state === 'saving' ? 'Creating...' : 'Create'}
                  </button>
                </div>
                {createError && <p className="form-error">{createError}</p>}
              </form>
            )}

            {createOpen && mode === 'block' && (
              <form className="inline-create-form" onSubmit={handleCreateVolume}>
                <label className="field">
                  <span>Volume name</span>
                  <input
                    name="volumeName"
                    type="text"
                    placeholder="database-data"
                    value={volumeDraft.name}
                    onChange={(e) =>
                      setVolumeDraft((draft) => ({ ...draft, name: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <input
                    name="volumeDescription"
                    type="text"
                    placeholder="PostgreSQL persistent data"
                    value={volumeDraft.description}
                    onChange={(e) =>
                      setVolumeDraft((draft) => ({ ...draft, description: e.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Size GiB</span>
                  <input
                    name="volumeSize"
                    type="number"
                    min="1"
                    value={volumeDraft.sizeGiB}
                    onChange={(e) =>
                      setVolumeDraft((draft) => ({
                        ...draft,
                        sizeGiB: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Snapshot</span>
                  <select
                    name="snapshotId"
                    value={volumeDraft.snapshotId}
                    onChange={(e) =>
                      setVolumeDraft((draft) => ({ ...draft, snapshotId: e.target.value }))
                    }
                  >
                    <option value="">None</option>
                    {snapshots.map((snapshot) => (
                      <option key={snapshot.id} value={snapshot.id}>
                        {snapshot.name} ({snapshot.sizeGiB} GiB)
                      </option>
                    ))}
                  </select>
                </label>
                <div className="action-row compact">
                  <button type="submit" className="primary-button">
                    Create
                  </button>
                </div>
                {createError && <p className="form-error">{createError}</p>}
              </form>
            )}

            <div className="inventory-toolbar">
              <label className="field inventory-search">
                <span>Search</span>
                <input
                  name="containerQuery"
                  type="text"
                  placeholder={mode === 'object' ? 'Search containers' : 'Search volumes'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>

            {containersError && mode === 'object' && (
              <p className="form-error" style={{ marginBottom: '12px' }}>
                {containersError}
              </p>
            )}
            {blockError && mode === 'block' && (
              <p className="form-error" style={{ marginBottom: '12px' }}>
                {blockError}
              </p>
            )}

            {mode === 'object' && (
              <div className="table-frame">
                <table className="flavor-table instance-table" data-ui="storage-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Created</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={3}
                          className="muted"
                          style={{ textAlign: 'center', padding: '24px' }}
                        >
                          불러오는 중...
                        </td>
                      </tr>
                    )}
                    {!isLoading && visible.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="muted"
                          style={{ textAlign: 'center', padding: '24px' }}
                        >
                          {containers.length === 0
                            ? '아직 컨테이너가 없습니다. 우측 상단의 New container 로 만들어 보세요.'
                            : '검색 결과가 없습니다.'}
                        </td>
                      </tr>
                    )}
                    {!isLoading &&
                      visible.map((container) => {
                        const isSelected = container.name === selectedContainerName;
                        return (
                          <tr
                            key={container.name}
                            className={isSelected ? 'selected' : ''}
                            onClick={() => setSelectedContainerName(container.name)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>
                              <strong>{container.name}</strong>
                            </td>
                            <td>{humanizeDate(container.created_at)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="ghost-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/storage/${encodeURIComponent(container.name)}`);
                                }}
                              >
                                Open
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {mode === 'block' && (
              <div className="table-frame">
                <table className="flavor-table instance-table" data-ui="block-storage-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Attached</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockLoading && (
                      <tr>
                        <td
                          colSpan={5}
                          className="muted"
                          style={{ textAlign: 'center', padding: '24px' }}
                        >
                          불러오는 중...
                        </td>
                      </tr>
                    )}
                    {!blockLoading && blockVisible.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="muted"
                          style={{ textAlign: 'center', padding: '24px' }}
                        >
                          {volumes.length === 0
                            ? '아직 Volume이 없습니다.'
                            : '검색 결과가 없습니다.'}
                        </td>
                      </tr>
                    )}
                    {!blockLoading &&
                      blockVisible.map((volume) => (
                        <tr
                          key={volume.id}
                          className={volume.id === selectedVolumeId ? 'selected' : ''}
                          onClick={() => setSelectedVolumeId(volume.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <strong>{volume.name}</strong>
                            {volume.description && <p className="muted">{volume.description}</p>}
                          </td>
                          <td>{volume.sizeGiB} GiB</td>
                          <td>{formatVolumeStatus(volume.status)}</td>
                          <td>{volume.attachments.length ? volume.attachments.length : 'None'}</td>
                          <td>{humanizeDate(volume.createdAt)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>

        <aside className="workspace-summary list-detail">
          <div className="summary-headline summary-headline-compact">
            <div>
              <p className="eyebrow">
                {mode === 'object' ? 'Container details' : 'Volume details'}
              </p>
              <h2>
                {mode === 'object'
                  ? (selected?.name ?? 'No selection')
                  : (selectedVolume?.name ?? 'No selection')}
              </h2>
            </div>
          </div>
          {mode === 'object' && selected ? (
            <>
              <dl className="summary-grid summary-grid-stack">
                <div>
                  <dt>Name</dt>
                  <dd className="summary-id">{selected.name}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{humanizeDate(selected.created_at)}</dd>
                </div>
              </dl>
              <div className="action-row compact sidebar-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate(`/storage/${encodeURIComponent(selected.name)}`)}
                >
                  Open container
                </button>
                <button
                  type="button"
                  className="danger-button"
                  disabled={busy}
                  onClick={() => handleDelete(selected.name)}
                >
                  {busy ? 'Deleting...' : 'Delete container'}
                </button>
              </div>
            </>
          ) : (
            mode === 'object' && <p className="muted">표시할 컨테이너가 없습니다.</p>
          )}
          {mode === 'block' && selectedVolume ? (
            <>
              <dl className="summary-grid summary-grid-stack">
                <div>
                  <dt>ID</dt>
                  <dd className="summary-id">{selectedVolume.id}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{formatVolumeStatus(selectedVolume.status)}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{selectedVolume.sizeGiB} GiB</dd>
                </div>
                <div>
                  <dt>Availability zone</dt>
                  <dd>{selectedVolume.availabilityZone || 'Default'}</dd>
                </div>
              </dl>

              <div className="inline-create-form">
                <label className="field">
                  <span>Attach to instance</span>
                  <select
                    value={attachInstanceId}
                    onChange={(event) => setAttachInstanceId(event.target.value)}
                    disabled={!canAttach}
                  >
                    <option value="">Select instance</option>
                    {instances.map((instance) => (
                      <option key={instance.id} value={instance.id}>
                        {instance.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="action-row compact sidebar-actions">
                  <button
                    type="button"
                    className="primary-button"
                    disabled={!canAttach || !attachInstanceId || busy}
                    onClick={() => handleAttachVolume(selectedVolume)}
                  >
                    Attach
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={!canDeleteVolume || busy}
                    onClick={() => handleDeleteVolume(selectedVolume)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedVolume.attachments.length > 0 && (
                <div className="summary-list">
                  {selectedVolume.attachments.map((attachment) => (
                    <div
                      key={`${attachment.instanceId}-${attachment.device}`}
                      className="summary-list-item"
                    >
                      <div>
                        <strong>{attachment.instanceName || attachment.instanceId}</strong>
                        <p className="muted">{attachment.device || 'Auto device'}</p>
                      </div>
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={busy}
                        onClick={() => handleDetachVolume(selectedVolume, attachment.instanceId)}
                      >
                        Detach
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="inline-create-form">
                <label className="field">
                  <span>Snapshot name</span>
                  <input
                    value={snapshotDraft.name}
                    onChange={(event) =>
                      setSnapshotDraft((draft) => ({ ...draft, name: event.target.value }))
                    }
                    placeholder="before-upgrade"
                    disabled={!canSnapshot}
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <input
                    value={snapshotDraft.description}
                    onChange={(event) =>
                      setSnapshotDraft((draft) => ({ ...draft, description: event.target.value }))
                    }
                    placeholder="Before PostgreSQL upgrade"
                    disabled={!canSnapshot}
                  />
                </label>
                <div className="action-row compact sidebar-actions">
                  <button
                    type="button"
                    className="primary-button"
                    disabled={!canSnapshot || !snapshotDraft.name.trim() || busy}
                    onClick={() => handleCreateSnapshot(selectedVolume)}
                  >
                    Snapshot
                  </button>
                </div>
              </div>

              <div className="summary-list">
                {selectedSnapshots.map((snapshot) => (
                  <div key={snapshot.id} className="summary-list-item">
                    <div>
                      <strong>{snapshot.name}</strong>
                      <p className="muted">
                        {snapshot.sizeGiB} GiB · {formatVolumeStatus(snapshot.status)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={busy || volumeStatuses.has(snapshot.status)}
                      onClick={() => handleDeleteSnapshot(snapshot)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            mode === 'block' && <p className="muted">표시할 Volume이 없습니다.</p>
          )}
        </aside>
      </main>
    </div>
  );
}

function formatVolumeStatus(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
