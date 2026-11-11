import type { Instance } from '../types';

interface VmSpec {
  vcpus: number;
  ramMb: number;
  diskGb: number;
}

interface VmCostReference {
  rcpSpec: VmSpec;
  comparisonSpec: VmSpec;
  productName: string;
  serverHourlyWon: number;
  diskHourlyWonPerGb?: number;
  note?: string;
}

const NCP_SSD_HOURLY_WON_PER_GB = 0.16;
const NCP_HIGH_CPU = 'NCP High CPU-g3 · 한국 리전 · VPC Linux';
const NCP_COMPACT = 'NCP Compact-g1 · 한국 리전 · Classic Linux';

export const VM_COST_SOURCES = {
  checkedOn: '2026-11-11',
  serverPricingUrl: 'https://www.ncloud.com/charge/region/ko?name=Server',
  diskPricingUrl: 'https://www.ncloud.com/charge/region/ko?name=Block+Storage',
};

const vmCostReferences: VmCostReference[] = [
  {
    rcpSpec: { vcpus: 1, ramMb: 512, diskGb: 10 },
    comparisonSpec: { vcpus: 1, ramMb: 1024, diskGb: 10 },
    productName: 'NCP Micro-g3 · 한국 리전 · VPC Linux',
    serverHourlyWon: 15,
    note: '유료 전환 후 공개 요금 기준이에요. 조건을 충족하는 신규 계정에는 무료 혜택이 있어요.',
  },
  {
    rcpSpec: { vcpus: 1, ramMb: 2048, diskGb: 20 },
    comparisonSpec: { vcpus: 1, ramMb: 2048, diskGb: 50 },
    productName: NCP_COMPACT,
    serverHourlyWon: 37,
  },
  {
    rcpSpec: { vcpus: 2, ramMb: 512, diskGb: 10 },
    comparisonSpec: { vcpus: 2, ramMb: 2048, diskGb: 50 },
    productName: NCP_COMPACT,
    serverHourlyWon: 64,
  },
  {
    rcpSpec: { vcpus: 2, ramMb: 4096, diskGb: 40 },
    comparisonSpec: { vcpus: 2, ramMb: 4096, diskGb: 40 },
    productName: NCP_HIGH_CPU,
    serverHourlyWon: 92,
    diskHourlyWonPerGb: NCP_SSD_HOURLY_WON_PER_GB,
  },
  {
    rcpSpec: { vcpus: 4, ramMb: 8192, diskGb: 80 },
    comparisonSpec: { vcpus: 4, ramMb: 8192, diskGb: 80 },
    productName: NCP_HIGH_CPU,
    serverHourlyWon: 192,
    diskHourlyWonPerGb: NCP_SSD_HOURLY_WON_PER_GB,
  },
  {
    rcpSpec: { vcpus: 8, ramMb: 16384, diskGb: 160 },
    comparisonSpec: { vcpus: 8, ramMb: 16384, diskGb: 160 },
    productName: NCP_HIGH_CPU,
    serverHourlyWon: 392,
    diskHourlyWonPerGb: NCP_SSD_HOURLY_WON_PER_GB,
  },
];

export function findVmCostReference(instance: Pick<Instance, 'vcpus' | 'ram' | 'disk'>) {
  const reference = vmCostReferences.find(
    ({ rcpSpec }) =>
      instance.vcpus === rcpSpec.vcpus &&
      instance.ram === rcpSpec.ramMb &&
      instance.disk === rcpSpec.diskGb,
  );
  if (!reference) return null;

  const diskHourlyWon = (reference.diskHourlyWonPerGb ?? 0) * reference.comparisonSpec.diskGb;

  return { ...reference, hourlyWon: reference.serverHourlyWon + diskHourlyWon };
}
