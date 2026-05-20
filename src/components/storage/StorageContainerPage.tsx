import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { EmptyBlock } from '../shared/EmptyBlock';
import { ROUTE_NAMES } from '../../constants';
import { formatBytes, humanizeDate } from '../../utils';

export function StorageContainerPage() {
  const navigate = useNavigate();
  const { name = '' } = useParams<{ name: string }>();
  const containerName = decodeURIComponent(name);

  const {
    containers,
    containersStatus,
    objectsByContainer,
    objectsStatus,
    objectsError,
    objectUpload,
    ensureContainers,
    ensureObjects,
    uploadFile,
    downloadFile,
    removeObject,
    removeContainer,
  } = useStore();

  const objects = objectsByContainer[containerName] ?? [];
  const status = objectsStatus[containerName] ?? 'idle';
  const exists = containers.some((c) => c.name === containerName);
  const containerMeta = containers.find((c) => c.name === containerName);

  const [query, setQuery] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void ensureContainers();
  }, [ensureContainers]);

  useEffect(() => {
    if (!containerName) return;
    void ensureObjects(containerName);
  }, [containerName, ensureObjects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter((o) => o.name.toLowerCase().includes(q));
  }, [objects, query]);

  const totalSize = useMemo(
    () => objects.reduce((sum, obj) => sum + (obj.size_bytes || 0), 0),
    [objects],
  );

  async function handlePickFile() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = await uploadFile(containerName, file);
    if (!result.ok) {
      alert(result.error ?? '업로드에 실패했습니다.');
    }
  }

  async function handleDownload(key: string) {
    setDownloadingKey(key);
    try {
      const result = await downloadFile(containerName, key);
      if (!result.ok) alert(result.error ?? '다운로드에 실패했습니다.');
    } finally {
      setDownloadingKey(null);
    }
  }

  async function handleDeleteObject(key: string) {
    if (!confirm(`'${key}' 객체를 삭제할까요?`)) return;
    setBusyKey(key);
    try {
      const result = await removeObject(containerName, key);
      if (!result.ok) alert(result.error ?? '삭제에 실패했습니다.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteContainer() {
    if (!confirm(`'${containerName}' 컨테이너를 삭제할까요?`)) return;
    const result = await removeContainer(containerName);
    if (result.state === 'not-empty') {
      const force = confirm(
        `'${containerName}' 컨테이너 안에 ${objects.length}개의 파일이 있습니다. 함께 삭제할까요?`,
      );
      if (!force) return;
      const forced = await removeContainer(containerName, true);
      if (forced.state === 'error') {
        alert(forced.message);
        return;
      }
    } else if (result.state === 'error') {
      alert(result.message);
      return;
    }
    navigate('/storage');
  }

  const isLoading = status === 'loading' || status === 'idle';
  const containersLoaded = containersStatus === 'ready';
  const notFound = containersLoaded && !exists;

  return (
    <div className="page page-instances shell-enter">
      <Topbar active={ROUTE_NAMES.storage} />
      <main className="workspace workspace-list">
        <section className="workspace-main list-main">
          <section className="editor-section editor-section-flat">
            <div className="section-head section-head-tight">
              <div>
                <p className="eyebrow">Storage</p>
                <h2>{containerName}</h2>
                <p className="muted section-support">
                  {containerMeta
                    ? `Created ${humanizeDate(containerMeta.created_at)}`
                    : '컨테이너 안의 객체를 관리합니다.'}
                </p>
              </div>
              <div className="action-row compact">
                <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
                <button
                  className="primary-button"
                  disabled={notFound || objectUpload.state === 'saving'}
                  onClick={() => void handlePickFile()}
                >
                  {objectUpload.state === 'saving' ? 'Uploading...' : 'Upload file'}
                </button>
                <button className="ghost-button" onClick={() => navigate('/storage')}>
                  Back
                </button>
              </div>
            </div>

            {notFound ? (
              <EmptyBlock
                title="컨테이너를 찾을 수 없습니다."
                description="목록으로 돌아가 다른 컨테이너를 선택해 주세요."
              />
            ) : (
              <>
                <div className="inventory-toolbar">
                  <label className="field inventory-search">
                    <span>Search</span>
                    <input
                      name="objectQuery"
                      type="text"
                      placeholder="Search objects"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <div className="toolbar-side">
                    <span className="toolbar-meta">Total {objects.length}</span>
                    <span className="toolbar-meta">{formatBytes(totalSize)}</span>
                  </div>
                </div>

                {objectsError && (
                  <p className="form-error" style={{ marginBottom: '12px' }}>
                    {objectsError}
                  </p>
                )}

                {objectUpload.state === 'error' && (
                  <p className="form-error" style={{ marginBottom: '12px' }}>
                    {objectUpload.message}
                  </p>
                )}

                <div className="table-frame">
                  <table className="flavor-table instance-table" data-ui="object-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Updated</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading && (
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
                      {!isLoading && visible.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="muted"
                            style={{ textAlign: 'center', padding: '24px' }}
                          >
                            {objects.length === 0
                              ? '아직 객체가 없습니다. Upload file 로 첫 파일을 올려 보세요.'
                              : '검색 결과가 없습니다.'}
                          </td>
                        </tr>
                      )}
                      {!isLoading &&
                        visible.map((obj) => (
                          <tr key={obj.name}>
                            <td>
                              <strong>{obj.name}</strong>
                            </td>
                            <td className="muted">{obj.content_type || '—'}</td>
                            <td>{formatBytes(obj.size_bytes)}</td>
                            <td>{humanizeDate(obj.last_modified)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div
                                className="action-row compact"
                                style={{ justifyContent: 'flex-end' }}
                              >
                                <button
                                  className="ghost-button"
                                  disabled={downloadingKey === obj.name}
                                  onClick={() => void handleDownload(obj.name)}
                                >
                                  {downloadingKey === obj.name ? 'Downloading...' : 'Download'}
                                </button>
                                <button
                                  className="danger-button"
                                  disabled={busyKey === obj.name}
                                  onClick={() => void handleDeleteObject(obj.name)}
                                >
                                  {busyKey === obj.name ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </section>

        <aside className="workspace-summary list-detail">
          <div className="summary-headline summary-headline-compact">
            <div>
              <p className="eyebrow">Container details</p>
              <h2>{containerName}</h2>
            </div>
          </div>
          {notFound ? (
            <p className="muted">컨테이너 정보를 표시할 수 없습니다.</p>
          ) : (
            <>
              <dl className="summary-grid summary-grid-stack">
                <div>
                  <dt>Objects</dt>
                  <dd>{objects.length}</dd>
                </div>
                <div>
                  <dt>Total size</dt>
                  <dd>{formatBytes(totalSize)}</dd>
                </div>
                {containerMeta && (
                  <div>
                    <dt>Created</dt>
                    <dd>{humanizeDate(containerMeta.created_at)}</dd>
                  </div>
                )}
              </dl>
              <div className="action-row compact sidebar-actions">
                <button
                  className="primary-button"
                  disabled={objectUpload.state === 'saving'}
                  onClick={() => void handlePickFile()}
                >
                  {objectUpload.state === 'saving' ? 'Uploading...' : 'Upload file'}
                </button>
                <button className="danger-button" onClick={() => void handleDeleteContainer()}>
                  Delete container
                </button>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
