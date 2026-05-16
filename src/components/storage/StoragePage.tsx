import { Topbar } from '../layout/Topbar';
import { ROUTE_NAMES } from '../../constants';

export function StoragePage() {
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
                  <tr>
                    <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '24px' }}>
                      표시할 버킷이 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="workspace-summary list-detail">
          <div className="summary-headline summary-headline-compact">
            <div>
              <p className="eyebrow">Bucket details</p>
              <h2>No selection</h2>
            </div>
          </div>
          <p className="muted">표시할 버킷이 없습니다.</p>
        </aside>
      </main>
    </div>
  );
}
