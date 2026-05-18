import type { ImageTemplate, NetworkTemplate } from '../types';

export const imageTemplates: ImageTemplate[] = [
  { key: 'rcp-ubuntu-2204', label: 'Ubuntu 22.04', id: 'd9f44127-1761-448d-8077-788128f4f0b5', description: '웹·앱 서버, 개발 환경, ML 등 범용 워크로드에 추천' },
  { key: 'rocky-9', label: 'Rocky Linux 9', id: 'b2565d72-0842-473b-837e-42b9fae286ab', description: 'RHEL 호환. 안정성이 중요한 엔터프라이즈 환경에 추천' },
  { key: 'cirros', label: 'cirros', id: '922f6f7a-ec26-4536-99cf-a64f4843a7ca', description: '수십 MB 초경량. 인스턴스 동작·네트워크 검증용 테스트 이미지' },
];

export const networkTemplates: NetworkTemplate[] = [
  { key: 'demo-net', label: 'demo-net', id: '5daf4369-9bd9-4dd8-b9da-f2b73ea7dbdb', description: 'VM 생성 검증이 완료된 기본 네트워크' },
  { key: 'public1', label: 'public1', id: 'b1d9feee-0039-4f0c-9c3e-39947b11a23b', description: 'OpenStack public1 네트워크' },
];

