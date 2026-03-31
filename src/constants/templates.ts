import type { ImageTemplate, NetworkTemplate, Flavor, StorageBucket } from '../types';

export const imageTemplates: ImageTemplate[] = [
  { key: 'ubuntu-2204', label: 'Ubuntu 22.04 LTS', id: 'img-ubuntu-22-04', description: '일반적인 개발 서버용 Linux 템플릿' },
  { key: 'rocky-9', label: 'Rocky Linux 9', id: 'img-rocky-linux-9', description: 'RHEL 계열 호환성 검증용 템플릿' },
  { key: 'debian-12', label: 'Debian 12', id: 'img-debian-12', description: '가볍고 안정적인 범용 템플릿' },
];

export const networkTemplates: NetworkTemplate[] = [
  { key: 'public-net', label: 'Public network', id: 'net-public', description: '외부 접속이 필요한 기본 세그먼트' },
  { key: 'private-net', label: 'Private network', id: 'net-private', description: '내부 서비스용 프라이빗 세그먼트' },
  { key: 'lab-net', label: 'Lab segment', id: 'net-lab', description: '과제/실험용 분리 네트워크' },
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
