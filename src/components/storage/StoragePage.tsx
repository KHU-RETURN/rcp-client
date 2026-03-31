import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { ROUTE_NAMES, storageBuckets } from '../../constants';
import { humanizeDate } from '../../utils';

export function StoragePage() {
  const { selectedBucketId, setSelectedBucketId } = useStore();
  const selectedBucket = storageBuckets.find((b) => b.id === selectedBucketId) ?? storageBuckets[0] ?? null;

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
                <p className="muted section-support">버킷과 오브젝트 저장 영역을 확인합니다.</p>
              </div>
            </div>

            <div className="table-frame">
              <table className="flavor-table instance-table" data-ui="storage-table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Class</th>
                    <th>Region</th>
                    <th>Objects</th>
                    <th>Size</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {storageBuckets.map((bucket) => (
                    <tr
                      key={bucket.id}
                      className={bucket.id === selectedBucketId ? 'selected' : ''}
                      onClick={() => setSelectedBucketId(bucket.id)}
                    >
                      <td><strong>{bucket.name}</strong></td>
                      <td>{bucket.class}</td>
                      <td>{bucket.region}</td>
                      <td>{bucket.objects.toLocaleString('en-US')}</td>
                      <td>{bucket.size}</td>
                      <td>{humanizeDate(bucket.updated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="workspace-summary list-detail">
          <div className="summary-headline summary-headline-compact">
            <div>
              <p className="eyebrow">Bucket details</p>
              <h2>{selectedBucket?.name ?? 'No selection'}</h2>
            </div>
          </div>
          {selectedBucket ? (
            <>
              <dl className="summary-grid large">
                <div><dt>Class</dt><dd>{selectedBucket.class}</dd></div>
                <div><dt>Region</dt><dd>{selectedBucket.region}</dd></div>
                <div><dt>Objects</dt><dd>{selectedBucket.objects.toLocaleString('en-US')}</dd></div>
                <div><dt>Size</dt><dd>{selectedBucket.size}</dd></div>
                <div><dt>Updated</dt><dd>{humanizeDate(selectedBucket.updated)}</dd></div>
              </dl>
              <div className="summary-note">
                <strong>Note</strong>
                <p>{selectedBucket.note}</p>
              </div>
            </>
          ) : (
            <p className="muted">표시할 버킷이 없습니다.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
