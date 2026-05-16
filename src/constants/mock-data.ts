import type { MockUser, ReleaseNote } from '../types';

export const GOOGLE_PREVIEW_USER: MockUser = {
  id: 'khu-google-user',
  name: 'KHU Google User',
  role: 'User',
  subtitle: 'khu.ac.kr account',
};

export const mockUsers: MockUser[] = [
  {
    id: 'jisung-return',
    name: 'Ji-sung',
    role: 'User',
    subtitle: 'return platform user',
  },
  {
    id: 'return-guest',
    name: 'Return Guest',
    role: 'User',
    subtitle: 'return platform user',
  },
];

export const releaseNotes: ReleaseNote[] = [
  {
    version: 'v0.4',
    title: 'Auth entry 재구성',
    body: '처음 진입 시 로그인, 가입, 수정사항을 각각 더 빠르게 확인할 수 있도록 entry UX를 재구성했습니다.',
  },
  {
    version: 'v0.3',
    title: 'Instances inventory 확장',
    body: '목록, 검색, 상태 필터, 결과 화면 연결이 추가되어 생성 이후 흐름이 끊기지 않습니다.',
  },
  {
    version: 'v0.2',
    title: 'xterm 기반 terminal',
    body: '실제 websocket SSH 전 단계로 xterm.js 기반 terminal UI와 reconnect 동작을 넣었습니다.',
  },
];

