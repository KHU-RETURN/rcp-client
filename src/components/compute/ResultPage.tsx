import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Topbar } from '../layout/Topbar';
import { ROUTE_NAMES, imageTemplates, networkTemplates } from '../../constants';
import { getTerminalAvailability, humanizeDate } from '../../utils';
import type { CreateInstanceResponse } from '../../types';

export function ResultPage() {
  const navigate = useNavigate();
  const { result, instances, flavors, ensureInstanceData } = useStore();
  const [now, setNow] = useState(() => Date.now());

  const inventoryInstance = result?.instanceId
    ? (instances.find((i) => i.id === result.instanceId) ?? null)
    : null;
  const terminalAvailability = getTerminalAvailability(inventoryInstance, now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (result?.type !== 'success' || terminalAvailability.canOpen) return;

    void ensureInstanceData();
    const timer = window.setInterval(() => {
      void ensureInstanceData();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [ensureInstanceData, result?.type, terminalAvailability.canOpen]);

  if (!result) {
    return (
      <div className="page page-result shell-enter">
        <Topbar active={ROUTE_NAMES.result} />
        <main className="result-layout">
          <section className="result-hero error">
            <p className="eyebrow">No receipt</p>
            <h1>아직 생성 결과가 없습니다</h1>
            <p className="muted">새로운 VM 생성 흐름으로 돌아가서 payload를 확인한 뒤 다시 요청해 주세요.</p>
            <div className="action-row">
              <button className="primary-button" onClick={() => navigate('/compute/create')}>
                Go to create workspace
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const response: Partial<CreateInstanceResponse> = result.response ?? {};
  const imageLabel = imageTemplates.find((item) => item.id === result.request?.image_id)?.label ?? '선택한 이미지';
  const networkLabel = result.request?.network_id
    ? (networkTemplates.find((item) => item.id === result.request?.network_id)?.label ?? '선택한 네트워크')
    : 'Not set';
  const flavorLabel = flavors.find((item) => item.id === result.request?.flavor_id)?.name
    ?? response.flavor?.name
    ?? response.flavor?.id
    ?? result.request?.flavor_id
    ?? '';
  const requestPreview = {
    name: result.request?.name ?? '',
    flavor: flavorLabel,
    image: imageLabel,
    network: networkLabel,
    ssh_key: result.request?.key_name ?? 'Optional',
  };

  return (
    <div className="page page-result shell-enter">
      <Topbar active={ROUTE_NAMES.result} />
      <main className="result-layout">
        <section className={`result-hero ${result.type === 'success' ? 'success' : 'error'}`}>
          <p className="eyebrow">{result.type === 'success' ? 'Request accepted' : 'Request failed'}</p>
          <h1>{result.type === 'success' ? '생성 요청이 접수되었습니다' : '생성 요청을 완료하지 못했습니다'}</h1>
          <p className="lead minor">
            {result.type === 'success'
              ? '백엔드 응답을 기준으로 receipt를 구성했습니다.'
              : (result.error ?? '알 수 없는 오류가 발생했습니다.')}
          </p>
          <div className="action-row">
            <button className="primary-button" onClick={() => navigate('/compute')}>
              View instances
            </button>
            <button className="ghost-button" onClick={() => navigate('/compute/create')}>
              Create another VM
            </button>
            {inventoryInstance && (
              <button
                className="ghost-button"
                disabled={!terminalAvailability.canOpen}
                title={
                  terminalAvailability.canOpen
                    ? 'Open terminal'
                    : terminalAvailability.waitSeconds > 0
                      ? `Terminal will be available in ${terminalAvailability.waitSeconds}s`
                      : terminalAvailability.reason
                }
                onClick={() => navigate(`/compute/instances/${encodeURIComponent(inventoryInstance.id)}/terminal`)}
              >
                {terminalAvailability.canOpen
                  ? 'Open terminal'
                  : terminalAvailability.waitSeconds > 0
                    ? `Terminal ready in ${terminalAvailability.waitSeconds}s`
                    : 'Terminal unavailable'}
              </button>
            )}
          </div>
        </section>

        <section className="result-grid" data-ui="result-grid">
          <article className="result-pane">
            <p className="eyebrow">Receipt</p>
            <dl className="summary-grid large">
              <div><dt>ID</dt><dd>{response.id ?? '-'}</dd></div>
              <div><dt>Name</dt><dd>{response.name ?? result.request?.name ?? '-'}</dd></div>
              <div><dt>Status</dt><dd>{response.status ?? (result.type === 'success' ? 'BUILD' : '-')}</dd></div>
              <div><dt>Created</dt><dd>{humanizeDate(response.created)}</dd></div>
              <div><dt>Flavor</dt><dd>{flavorLabel || '-'}</dd></div>
              <div><dt>Network</dt><dd>{networkLabel}</dd></div>
            </dl>
          </article>
          <article className="result-pane">
            <p className="eyebrow">Payload</p>
            <pre className="code-block">{JSON.stringify(requestPreview, null, 2)}</pre>
          </article>
          <article className="result-pane">
            <p className="eyebrow">Response</p>
            <pre className="code-block">
              {JSON.stringify(
                result.type === 'success' ? response : { error: result.error ?? 'unknown error' },
                null,
                2,
              )}
            </pre>
          </article>
        </section>
      </main>
    </div>
  );
}
