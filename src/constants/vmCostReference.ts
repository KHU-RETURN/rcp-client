export const VM_COST_REFERENCE = {
  rcpSpec: { vcpus: 2, ramMb: 4096, diskGb: 40 },
  productName: 'NCP High CPU-g3 · 한국 리전 · VPC Linux',
  serverHourlyWon: 92,
  diskHourlyWonPerGb: 0.16,
  checkedOn: '2026-11-11',
  serverPricingUrl: 'https://www.ncloud.com/charge/price/ko',
  diskPricingUrl: 'https://www.ncloud.com/api-cms/service-product/static/blockStorage',
};

export const VM_COST_HOURLY_RATE =
  VM_COST_REFERENCE.serverHourlyWon +
  VM_COST_REFERENCE.rcpSpec.diskGb * VM_COST_REFERENCE.diskHourlyWonPerGb;
