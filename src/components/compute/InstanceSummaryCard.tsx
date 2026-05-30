import type { ReactNode } from 'react';
import { InlineBadge } from '../shared/InlineBadge';
import { imageTemplates } from '../../constants';
import { getDisplayInstanceId, humanizeDate, statusTone } from '../../utils';
import type { Instance } from '../../types';

interface InstanceSummaryCardProps {
  instance: Instance | null;
  emptyMessage?: string;
  actions?: ReactNode;
}

export function InstanceSummaryCard({
  instance,
  emptyMessage = '표시할 인스턴스가 없습니다.',
  actions,
}: InstanceSummaryCardProps) {
  return (
    <aside className="workspace-summary list-detail">
      <div className="summary-headline summary-headline-compact">
        <div>
          <p className="eyebrow">Instance details</p>
          <h2>{instance?.name ?? 'No selection'}</h2>
        </div>
        {instance && <InlineBadge tone={statusTone(instance.status)} label={instance.status} />}
      </div>
      {instance ? (
        <>
          <dl className="summary-grid summary-grid-stack">
            <div>
              <dt>ID</dt>
              <dd className="summary-id">{getDisplayInstanceId(instance.id)}</dd>
            </div>
            <div>
              <dt>Flavor</dt>
              <dd>{instance.flavorName || instance.flavorId || '—'}</dd>
            </div>
            <div>
              <dt>OS</dt>
              <dd>
                {imageTemplates.find((t) => t.id === instance.imageId)?.label ??
                  (instance.imageId ? instance.imageId.slice(0, 8) : '—')}
              </dd>
            </div>
            <div>
              <dt>SSH key</dt>
              <dd>{instance.keyName || 'Not registered'}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                {instance.created && !instance.created.startsWith('0001')
                  ? humanizeDate(instance.created)
                  : '—'}
              </dd>
            </div>
          </dl>
          <div className="summary-note">
            <strong>Note</strong>
            <p>{instance.note || 'No note'}</p>
          </div>
          {actions && <div className="action-row compact sidebar-actions">{actions}</div>}
        </>
      ) : (
        <p className="muted">{emptyMessage}</p>
      )}
    </aside>
  );
}
