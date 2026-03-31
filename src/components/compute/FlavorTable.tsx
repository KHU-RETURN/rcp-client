import { useStore } from '../../store';
import { formatRam, getRecommendation } from '../../utils';
import { EmptyBlock } from '../shared/EmptyBlock';
import type { Flavor } from '../../types';

interface FlavorTableProps {
  selectedFlavorId: string;
  onSelectFlavor: (flavorId: string) => void;
}

export function FlavorTable({ selectedFlavorId, onSelectFlavor }: FlavorTableProps) {
  const { flavors, flavorsStatus } = useStore();

  if (flavorsStatus === 'loading') {
    return (
      <div className="skeleton-band" aria-hidden="true">
        <div /><div /><div />
      </div>
    );
  }

  if (!flavors.length) {
    return (
      <EmptyBlock
        title="사용 가능한 flavor가 없습니다."
        description="현재 quota 기준으로 생성 가능한 사양이 없습니다."
      />
    );
  }

  return (
    <table className="flavor-table" data-ui="flavor-table">
      <thead>
        <tr>
          <th>Flavor</th>
          <th>vCPU</th>
          <th>RAM</th>
          <th>Disk</th>
          <th>Max</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        {flavors.map((flavor: Flavor, index: number) => {
          const disabled = flavor.max_configurable === 0;
          const selected = selectedFlavorId === flavor.id;
          return (
            <tr
              key={flavor.id}
              className={`${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && onSelectFlavor(flavor.id)}
            >
              <td>
                <strong>{flavor.name}</strong>
                <small>{selected ? 'Selected' : disabled ? 'Unavailable' : 'Available now'}</small>
              </td>
              <td>{flavor.vcpus}</td>
              <td>{formatRam(flavor.ram)}</td>
              <td>{flavor.disk} GB</td>
              <td>{flavor.max_configurable}</td>
              <td>{getRecommendation(flavor, index)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
