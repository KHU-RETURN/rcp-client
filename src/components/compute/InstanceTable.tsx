import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { InlineBadge } from '../shared/InlineBadge';
import { EmptyBlock } from '../shared/EmptyBlock';
import {
  getDisplayInstanceId,
  getInstanceSourceLabel,
  getTerminalAvailability,
  getVisibleInstances,
  humanizeDate,
  statusTone,
} from '../../utils';
import type { Instance } from '../../types';
import { imageTemplates } from '../../constants';

export function InstanceTable() {
  const navigate = useNavigate();
  const { instances, selectedInstanceId, instanceQuery, instanceStatusFilter, setSelectedInstanceId } = useStore();
  const [now, setNow] = useState(() => Date.now());

  const visible = getVisibleInstances(instances, instanceQuery, instanceStatusFilter);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  function handleOpenTerminal(e: React.MouseEvent, instance: Instance) {
    e.stopPropagation();
    if (!getTerminalAvailability(instance, now).canOpen) return;
    navigate(`/compute/instances/${encodeURIComponent(instance.id)}/terminal`);
  }

  function renderRow(instance: Instance) {
    const terminalAvailability = getTerminalAvailability(instance, now);

    return (
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
        <td>{imageTemplates.find((t) => t.id === instance.imageId)?.label ?? instance.imageId.slice(0, 8)}</td>
        <td>{getInstanceSourceLabel(instance.source)}</td>
        <td>{instance.created?.startsWith('0001') ? '—' : humanizeDate(instance.created)}</td>
        <td>
          <button
            className="ghost-button ghost-button-small"
            disabled={!terminalAvailability.canOpen}
            title={
              terminalAvailability.canOpen
                ? 'Open terminal'
                : terminalAvailability.waitSeconds > 0
                  ? `Terminal will be available in ${terminalAvailability.waitSeconds}s`
                  : terminalAvailability.reason
            }
            onClick={(e) => handleOpenTerminal(e, instance)}
          >
            {terminalAvailability.canOpen
              ? 'Open'
              : terminalAvailability.waitSeconds > 0
                ? `${terminalAvailability.waitSeconds}s`
                : 'Wait'}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <table className="flavor-table instance-table" data-ui="instance-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>OS</th>
          <th>Source</th>
          <th>Created</th>
          <th>Terminal</th>
        </tr>
      </thead>
      <tbody>
        {visible.map(renderRow)}
      </tbody>
    </table>
  );
}
