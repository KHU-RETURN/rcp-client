import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { ROUTE_NAMES } from '../../constants';
import { humanizeDate } from '../../utils';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [createError, setCreateError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureContainers();
  }, [ensureContainers]);

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

  const isLoading = containersStatus === 'loading' || containersStatus === 'idle';

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.storage} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Storage</p>
                <h2>Object Storage</h2>
                <p className="muted section-support">컨테이너 단위로 파일을 보관합니다.</p>
              </div>
              <div className="section-head-meta">
                <div className="section-stats" role="group" aria-label="Storage summary">
                  <div className="mini-stat">
                    <span>Visible</span>
                    <strong>{visible.length}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Total</span>
                    <strong>{containers.length}</strong>
                  </div>
                </div>
                <button className="primary-button" onClick={() => setCreateOpen((v) => !v)}>
                  {createOpen ? 'Cancel' : 'New container'}
                </button>
              </div>
            </div>

            {createOpen && (
              <form className="inline-create-form" onSubmit={handleCreate}>
                <label className="field">
                  <span>Container name</span>
                  <input
                    name="containerName"
                    type="text"
                    placeholder="my-photos"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    autoFocus
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

            <div className="inventory-toolbar">
              <label className="field inventory-search">
                <span>Search</span>
                <input
                  name="containerQuery"
                  type="text"
                  placeholder="Search containers"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>

            {containersError && (
              <p className="form-error" style={{ marginBottom: '12px' }}>
                {containersError}
              </p>
            )}

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
          </section>
        </section>

        <aside className="workspace-summary list-detail">
          <div className="summary-headline summary-headline-compact">
            <div>
              <p className="eyebrow">Container details</p>
              <h2>{selected?.name ?? 'No selection'}</h2>
            </div>
          </div>
          {selected ? (
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
                  className="primary-button"
                  onClick={() => navigate(`/storage/${encodeURIComponent(selected.name)}`)}
                >
                  Open container
                </button>
                <button
                  className="danger-button"
                  disabled={busy}
                  onClick={() => handleDelete(selected.name)}
                >
                  {busy ? 'Deleting...' : 'Delete container'}
                </button>
              </div>
            </>
          ) : (
            <p className="muted">표시할 컨테이너가 없습니다.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
