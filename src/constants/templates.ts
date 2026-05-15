import type { ImageTemplate, NetworkTemplate, Flavor, StorageBucket } from '../types';

export const imageTemplates: ImageTemplate[] = [
  { key: 'rcp-ubuntu-2204', label: 'RCP Ubuntu 22.04', id: 'd9f44127-1761-448d-8077-788128f4f0b5', description: 'Ubuntu 22.04 이미지' },
  // { key: 'ubuntu-2204', label: 'ubuntu-22.04', id: 'fd71b896-a330-41dc-b07c-486b2653395f', description: 'Ubuntu 22.04 이미지' },
  { key: 'cirros', label: 'cirros', id: '922f6f7a-ec26-4536-99cf-a64f4843a7ca', description: '가벼운 테스트용 초경량 리눅스 이미지' },
  { key: 'rocky-9', label: 'Rocky Linux 9', id: 'b2565d72-0842-473b-837e-42b9fae286ab', description: 'Rocky Linux 9 이미지' },
];

export const networkTemplates: NetworkTemplate[] = [
  { key: 'demo-net', label: 'demo-net', id: '5daf4369-9bd9-4dd8-b9da-f2b73ea7dbdb', description: 'VM 생성 검증이 완료된 기본 네트워크' },
  { key: 'public1', label: 'public1', id: 'b1d9feee-0039-4f0c-9c3e-39947b11a23b', description: 'OpenStack public1 네트워크' },
];

export const demoFlavors: Flavor[] = [
  { id: 'm1.small', name: 'm1.small', vcpus: 1, ram: 2048, disk: 20, max_configurable: 5 },
  { id: 'm1.medium', name: 'm1.medium', vcpus: 2, ram: 4096, disk: 40, max_configurable: 3 },
  { id: 'm1.large', name: 'm1.large', vcpus: 4, ram: 8192, disk: 80, max_configurable: 1 },
  { id: 'c1.large', name: 'c1.large', vcpus: 8, ram: 8192, disk: 60, max_configurable: 0 },
];

export const storageBuckets: StorageBucket[] = [
  {
    id: 'media-assets',
    name: 'media-assets',
    class: 'Standard',
    region: 'KR-Seoul',
    objects: 1842,
    size: '48.2 GB',
    updated: '2026-03-29T08:20:00Z',
    note: '서비스 업로드 파일과 이미지 자산',
  },
  {
    id: 'instance-backups',
    name: 'instance-backups',
    class: 'Archive',
    region: 'KR-Seoul',
    objects: 96,
    size: '312.4 GB',
    updated: '2026-03-28T22:10:00Z',
    note: '정기 백업과 장기 보관 파일',
  },
];
