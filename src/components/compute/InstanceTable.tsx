import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { InlineBadge } from '../shared/InlineBadge';
import { EmptyBlock } from '../shared/EmptyBlock';
import { humanizeDate, statusTone, getDisplayInstanceId, getInstanceSourceLabel, getVisibleInstances } from '../../utils';
import type { Instance } from '../../types';

export function InstanceTable() {
  const navigate = useNavigate();
  const { instances, selectedInstanceId, instanceQuery, instanceStatusFilter, setSelectedInstanceId } = useStore();

  const visible = getVisibleInstances(instances, instanceQuery, instanceStatusFilter);

  if (!visible.length) {
    return (
      <EmptyBlock
        title="일치하는 인스턴스가 없습니다."
        description="검색어 또는 상태 필터를 바꿔 보세요."
      />
    );
  }

  function handleRowClick(instance: Instance) {
    setSelectedInstanceId(instance.id);
  }

  function handleOpenTerminal(e: React.MouseEvent, instanceId: string) {
    e.stopPropagation();
    navigate(`/compute/instances/${encodeURIComponent(instanceId)}/terminal`);
  }

  return (
    <table className="flavor-table instance-table" data-ui="instance-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Flavor</th>
          <th>Source</th>
          <th>Created</th>
          <th>Terminal</th>
        </tr>
      </thead>
      <tbody>
        {visible.map((instance) => (
          <tr
            key={instance.id}
            className={instance.id === selectedInstanceId ? 'selected' : ''}
            onClick={() => handleRowClick(instance)}
          >
            <td>
              <strong>{instance.name}</strong>
              <small>{getDisplayInstanceId(instance.id)}</small>
            </td>
            <td>
              <InlineBadge tone={statusTone(instance.status)} label={instance.status} />
            </td>
            <td>{instance.flavorId}</td>
            <td>{getInstanceSourceLabel(instance.source)}</td>
            <td>{humanizeDate(instance.created)}</td>
            <td>
              <button
                className="ghost-button ghost-button-small"
                onClick={(e) => handleOpenTerminal(e, instance.id)}
              >
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
