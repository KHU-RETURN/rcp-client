// Source of truth: rcp-front/PRD.md

const config = {
  apiBaseUrl: (window.__RCP_CONFIG__?.apiBaseUrl || '').replace(/\/$/, ''),
  demoMode: window.__RCP_CONFIG__?.demoMode || 'auto',
};

const BRAND_ASSETS = {
  dark: '/assets/return-black.png',
  light: '/assets/return-white.png',
};

const GOOGLE_PREVIEW_USER = {
  id: 'khu-google-user',
  name: 'KHU Google User',
  role: 'User',
  subtitle: 'khu.ac.kr account',
};

const ROUTE_NAMES = {
  login: 'login',
  signup: 'signup',
  changes: 'changes',
  instances: 'instances',
  storage: 'storage',
  create: 'create',
  detail: 'detail',
  result: 'result',
  terminal: 'terminal',
};

const STORAGE_KEYS = {
  session: 'rcp-front.session',
  draft: 'rcp-front.draft',
  result: 'rcp-front.result',
  instances: 'rcp-front.instances',
  selectedInstanceId: 'rcp-front.selected-instance-id',
  authUsers: 'rcp-front.auth-users',
};

const mockUsers = [
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

const releaseNotes = [
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

const imageTemplates = [
  { key: 'ubuntu-2204', label: 'Ubuntu 22.04 LTS', id: 'img-ubuntu-22-04', description: '일반적인 개발 서버용 Linux 템플릿' },
  { key: 'rocky-9', label: 'Rocky Linux 9', id: 'img-rocky-linux-9', description: 'RHEL 계열 호환성 검증용 템플릿' },
  { key: 'debian-12', label: 'Debian 12', id: 'img-debian-12', description: '가볍고 안정적인 범용 템플릿' },
];

const networkTemplates = [
  { key: 'public-net', label: 'Public network', id: 'net-public', description: '외부 접속이 필요한 기본 세그먼트' },
  { key: 'private-net', label: 'Private network', id: 'net-private', description: '내부 서비스용 프라이빗 세그먼트' },
  { key: 'lab-net', label: 'Lab segment', id: 'net-lab', description: '과제/실험용 분리 네트워크' },
];

const demoFlavors = [
  { id: 'm1.small', name: 'm1.small', vcpus: 1, ram: 2048, disk: 20, max_configurable: 5 },
  { id: 'm1.medium', name: 'm1.medium', vcpus: 2, ram: 4096, disk: 40, max_configurable: 3 },
  { id: 'm1.large', name: 'm1.large', vcpus: 4, ram: 8192, disk: 80, max_configurable: 1 },
  { id: 'c1.large', name: 'c1.large', vcpus: 8, ram: 8192, disk: 60, max_configurable: 0 },
];

const storageBuckets = [
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

const sectionOrder = ['basic', 'compute', 'image-network', 'access', 'review'];
const app = document.querySelector('#app');

const defaultDraft = () => ({
  name: '',
  description: '',
  selectedFlavorId: '',
  imageTemplate: imageTemplates[0].key,
  imageAssistEnabled: true,
  imageId: imageTemplates[0].id,
  networkTemplate: networkTemplates[0].key,
  networkAssistEnabled: false,
  networkId: '',
  keypairName: '',
  publicKey: '',
});

const defaultSignupForm = () => ({
  name: '',
  handle: '',
  rolePreset: 'student',
  subtitle: '',
});

const state = {
  route: parseRoute(window.location.pathname),
  session: readStorage(STORAGE_KEYS.session, null),
  customMockUsers: readStorage(STORAGE_KEYS.authUsers, []),
  draft: { ...defaultDraft(), ...readStorage(STORAGE_KEYS.draft, {}) },
  authMessage: null,
  signupForm: defaultSignupForm(),
  result: readStorage(STORAGE_KEYS.result, null),
  instances: readStorage(STORAGE_KEYS.instances, buildSeedInstances()),
  selectedInstanceId: readStorage(STORAGE_KEYS.selectedInstanceId, null),
  selectedBucketId: storageBuckets[0]?.id || null,
  instanceQuery: '',
  instanceStatusFilter: 'all',
  pendingRoutePath: null,
  backendHealthStatus: config.demoMode === 'force' ? 'ready' : 'idle',
  flavors: [],
  flavorsStatus: 'idle',
  connectionMode: config.demoMode === 'force' ? 'demo' : 'checking',
  connectionReason: '',
  keypairStatus: { state: 'idle', message: '', response: null },
  creationStatus: { state: 'idle', message: '' },
  terminalRuntime: null,
  terminalModules: null,
  terminalFullscreen: false,
  terminalReconnectTimer: null,
};

function buildSeedInstances() {
  return [
    {
      id: 'mock-lab-web-01',
      name: 'lab-web-01',
      status: 'ACTIVE',
      created: '2026-03-24T09:30:00Z',
      updated: '2026-03-24T09:34:00Z',
      flavorId: 'm1.small',
      imageId: 'img-ubuntu-22-04',
      networkId: 'net-public',
      keyName: 'student-key',
      mode: 'demo',
      source: 'mock-seed',
      note: '웹 프로그래밍 실습용 프런트 서버',
    },
    {
      id: 'mock-data-batch-01',
      name: 'data-batch-01',
      status: 'BUILD',
      created: '2026-03-25T08:10:00Z',
      updated: '2026-03-25T08:10:00Z',
      flavorId: 'm1.medium',
      imageId: 'img-rocky-linux-9',
      networkId: 'net-private',
      keyName: '',
      mode: 'demo',
      source: 'mock-seed',
      note: '배치 작업 검증 중인 샘플 인스턴스',
    },
  ];
}

function parseRoute(pathname) {
  if (pathname === '/' || pathname === '/login') {
    return { name: ROUTE_NAMES.login, path: '/login' };
  }

  if (pathname === '/signup') {
    return { name: ROUTE_NAMES.signup, path: '/signup' };
  }

  if (pathname === '/changes') {
    return { name: ROUTE_NAMES.changes, path: '/changes' };
  }

  if (pathname === '/storage') {
    return { name: ROUTE_NAMES.storage, path: '/storage' };
  }

  if (pathname === '/compute' || pathname === '/instances') {
    return { name: ROUTE_NAMES.instances, path: '/compute' };
  }

  if (pathname === '/compute/create' || pathname === '/instances/new') {
    return { name: ROUTE_NAMES.create, path: '/compute/create' };
  }

  if (pathname === '/compute/create/result' || pathname === '/instances/create/result') {
    return { name: ROUTE_NAMES.result, path: '/compute/create/result' };
  }

  const detailMatch = pathname.match(/^\/(?:compute\/instances|instances)\/([^/]+)$/);
  if (detailMatch) {
    const instanceId = decodeURIComponent(detailMatch[1]);
    return {
      name: ROUTE_NAMES.detail,
      path: `/compute/instances/${encodeURIComponent(instanceId)}`,
      instanceId,
    };
  }

  const terminalMatch = pathname.match(/^\/(?:compute\/instances|instances)\/([^/]+)\/terminal$/);
  if (terminalMatch) {
    const instanceId = decodeURIComponent(terminalMatch[1]);
    return {
      name: ROUTE_NAMES.terminal,
      path: `/compute/instances/${encodeURIComponent(instanceId)}/terminal`,
      instanceId,
    };
  }

  return { name: ROUTE_NAMES.login, path: '/login' };
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function persistDraft() {
  writeStorage(STORAGE_KEYS.draft, state.draft);
}

function persistResult() {
  writeStorage(STORAGE_KEYS.result, state.result);
}

function persistInstances() {
  writeStorage(STORAGE_KEYS.instances, state.instances);
}

function persistSelectedInstance() {
  writeStorage(STORAGE_KEYS.selectedInstanceId, state.selectedInstanceId);
}

function persistSelectedBucket() {
  writeStorage(STORAGE_KEYS.selectedBucketId, state.selectedBucketId);
}

function persistAuthUsers() {
  writeStorage(STORAGE_KEYS.authUsers, state.customMockUsers);
}

function clearResult() {
  state.result = null;
  localStorage.removeItem(STORAGE_KEYS.result);
}

function getAuthUsers() {
  return [...mockUsers, ...state.customMockUsers];
}

function getRolePresetMeta(preset) {
  if (preset === 'admin') {
    return {
      role: 'User',
      subtitle: 'return platform user',
    };
  }

  return {
    role: 'User',
    subtitle: 'return platform user',
  };
}

function normalizeHandle(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

function navigate(path, options = {}) {
  const route = parseRoute(path);
  const method = options.replace ? 'replaceState' : 'pushState';

  if (window.location.pathname !== route.path) {
    window.history[method]({}, '', route.path);
  }

  state.route = route;
  render();

  if (!options.instant) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (route.name === ROUTE_NAMES.create && state.session) {
    ensureFlavorData();
  } else if (route.name !== ROUTE_NAMES.login && state.session) {
    ensureBackendHealth();
  }
}

window.addEventListener('popstate', () => {
  state.route = parseRoute(window.location.pathname);
  render();
  if (state.route.name === ROUTE_NAMES.create && state.session) {
    ensureFlavorData();
  } else if (state.route.name !== ROUTE_NAMES.login && state.session) {
    ensureBackendHealth();
  }
});

function withBaseUrl(path) {
  return `${config.apiBaseUrl}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(withBaseUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = text ? { error: text } : null;
  }

  if (!response.ok) {
    const error = new Error(body?.error || `Request failed with ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function ensureBackendHealth() {
  if (config.demoMode === 'force') {
    state.connectionMode = 'demo';
    state.connectionReason = 'config.demoMode=force';
    state.backendHealthStatus = 'ready';
    render();
    return;
  }

  if (state.backendHealthStatus === 'loading' || state.backendHealthStatus === 'ready') {
    return;
  }

  state.backendHealthStatus = 'loading';
  render();

  try {
    const data = await apiRequest('/__health/backend');
    state.connectionMode = data.available ? 'live' : 'demo';
    state.connectionReason = data.available ? '' : data.error || 'backend unavailable';
  } catch (error) {
    state.connectionMode = 'demo';
    state.connectionReason = error.message;
  }

  state.backendHealthStatus = 'ready';
  render();
}

async function ensureFlavorData() {
  if (state.flavorsStatus === 'loading' || state.flavorsStatus === 'ready') {
    return;
  }

  state.flavorsStatus = 'loading';
  render();

  if (state.backendHealthStatus === 'idle') {
    await ensureBackendHealth();
  }

  if (config.demoMode === 'force') {
    state.connectionMode = 'demo';
    state.connectionReason = 'config.demoMode=force';
    state.flavors = sortFlavors(demoFlavors);
    state.flavorsStatus = 'ready';
    ensureDefaultFlavor();
    render();
    return;
  }

  if (state.connectionMode !== 'live') {
    state.flavors = sortFlavors(demoFlavors);
    state.flavorsStatus = 'ready';
    ensureDefaultFlavor();
    render();
    return;
  }

  try {
    const data = await apiRequest('/api/v1/compute/flavors/available');
    state.flavors = sortFlavors(data);
    state.flavorsStatus = 'ready';
    state.connectionMode = 'live';
    state.connectionReason = '';
  } catch (error) {
    state.flavors = sortFlavors(demoFlavors);
    state.flavorsStatus = 'ready';
    state.connectionMode = 'demo';
    state.connectionReason = error.message;
  }

  ensureDefaultFlavor();
  render();
}

function sortFlavors(flavors) {
  return [...flavors].sort((a, b) => {
    if ((b.max_configurable || 0) !== (a.max_configurable || 0)) {
      return (b.max_configurable || 0) - (a.max_configurable || 0);
    }
    return (a.vcpus || 0) - (b.vcpus || 0);
  });
}

function ensureDefaultFlavor() {
  if (state.draft.selectedFlavorId && state.flavors.some((item) => item.id === state.draft.selectedFlavorId)) {
    return;
  }

  const firstSelectable = state.flavors.find((item) => item.max_configurable > 0) || state.flavors[0];
  if (firstSelectable) {
    state.draft.selectedFlavorId = firstSelectable.id;
    persistDraft();
  }
}

function getSelectedFlavor() {
  return state.flavors.find((item) => item.id === state.draft.selectedFlavorId) || null;
}

function getSelectedImageTemplate() {
  return imageTemplates.find((item) => item.key === state.draft.imageTemplate) || null;
}

function getSelectedNetworkTemplate() {
  return networkTemplates.find((item) => item.key === state.draft.networkTemplate) || null;
}

function ensureSelectedInstance() {
  if (state.selectedInstanceId && state.instances.some((item) => item.id === state.selectedInstanceId)) {
    return;
  }

  state.selectedInstanceId = state.instances[0]?.id || null;
  persistSelectedInstance();
}

function getSelectedInstance() {
  ensureSelectedInstance();
  return state.instances.find((item) => item.id === state.selectedInstanceId) || null;
}

function getSelectedBucket() {
  return storageBuckets.find((item) => item.id === state.selectedBucketId) || storageBuckets[0] || null;
}

function getVisibleInstances() {
  const query = state.instanceQuery.trim().toLowerCase();
  const status = state.instanceStatusFilter;
  return state.instances.filter((instance) => {
    const matchesQuery =
      !query ||
      instance.name.toLowerCase().includes(query) ||
      instance.id.toLowerCase().includes(query) ||
      instance.flavorId.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || String(instance.status || '').toLowerCase() === status;
    return matchesQuery && matchesStatus;
  });
}

function getInstanceById(id) {
  return state.instances.find((item) => item.id === id) || null;
}

function upsertInstance(instance) {
  const next = [...state.instances];
  const index = next.findIndex((item) => item.id === instance.id);
  if (index >= 0) {
    next[index] = { ...next[index], ...instance };
  } else {
    next.unshift(instance);
  }
  state.instances = next;
  state.selectedInstanceId = instance.id;
  persistInstances();
  persistSelectedInstance();
}

function buildPayload() {
  const payload = {
    name: state.draft.name.trim(),
    image_id: state.draft.imageId.trim(),
    flavor_id: state.draft.selectedFlavorId,
  };

  if (state.draft.networkId.trim()) {
    payload.network_id = state.draft.networkId.trim();
  }

  return payload;
}

function formatRam(value) {
  if (!value && value !== 0) return '-';
  const gb = value / 1024;
  return Number.isInteger(gb) ? `${gb} GB` : `${gb.toFixed(1)} GB`;
}

function humanizeDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function validateName(name) {
  const trimmed = name.trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,30}[a-zA-Z0-9]$/.test(trimmed) || /^[a-zA-Z0-9]{2,32}$/.test(trimmed);
}

function validatePublicKey(key) {
  return /^(ssh-(rsa|ed25519)|ecdsa-sha2-nistp(?:256|384|521))\s+[A-Za-z0-9+/=]+(?:\s+.+)?$/.test(key.trim());
}

function getSectionStates() {
  const selectedFlavor = getSelectedFlavor();
  const publicKeyPresent = state.draft.publicKey.trim().length > 0;
  const keyNamePresent = state.draft.keypairName.trim().length > 0;
  const keyNameValid = state.draft.keypairName.trim().length >= 2;
  const publicKeyValid = !publicKeyPresent || validatePublicKey(state.draft.publicKey);

  return {
    basic: {
      title: 'Basic information',
      valid: validateName(state.draft.name),
      error: state.draft.name.trim().length > 0 && !validateName(state.draft.name),
    },
    compute: {
      title: 'Compute sizing',
      valid: Boolean(selectedFlavor && selectedFlavor.max_configurable > 0),
      error: Boolean(selectedFlavor && selectedFlavor.max_configurable === 0),
    },
    'image-network': {
      title: 'Image & network',
      valid: Boolean(state.draft.imageId.trim()),
      error: !state.draft.imageId.trim(),
    },
    access: {
      title: 'Access',
      valid:
        state.keypairStatus.state === 'saved' ||
        state.keypairStatus.state === 'demo' ||
        (!keyNamePresent && !publicKeyPresent),
      error: Boolean((keyNamePresent && !keyNameValid) || (publicKeyPresent && !publicKeyValid)),
    },
    review: {
      title: 'Review',
      valid: validateName(state.draft.name) && Boolean(selectedFlavor) && selectedFlavor?.max_configurable > 0 && Boolean(state.draft.imageId.trim()),
      error: false,
    },
  };
}

function getAppHealth() {
  if (state.connectionMode === 'live') {
    return {
      label: 'Connected',
      tone: 'live',
      detail: '실시간 백엔드 연결',
    };
  }

  if (state.connectionMode === 'demo') {
    return {
      label: 'Preview mode',
      tone: 'demo',
      detail: '로컬 데이터 기반 미리보기',
    };
  }

  return {
    label: 'Checking',
    tone: 'neutral',
    detail: '연결 확인 중',
  };
}

function getInstancesHealth() {
  return state.connectionMode === 'live'
    ? '최근 인스턴스'
    : '샘플 · 최근 생성 인스턴스';
}

function getInstanceSourceLabel(source) {
  if (source === 'mock-seed') return 'Default';
  if (source === 'mock-created') return 'New';
  if (source === 'local-live') return 'Created';
  return source;
}

function getDisplayInstanceId(id) {
  return String(id || '').replace(/^mock-/, '');
}

function getRecommendation(flavor, index) {
  if (flavor.max_configurable === 0) return 'Quota limit';
  if (index === 1) return 'Balanced';
  if (index === 0) return 'Fast start';
  return 'Available';
}

function statusTone(status) {
  const upper = String(status || '').toUpperCase();
  if (upper === 'ACTIVE') return 'valid';
  if (upper === 'BUILD') return 'pending';
  if (upper === 'ERROR' || upper === 'FAILED') return 'error';
  return 'pending';
}

function translateError(message) {
  if (!message) return '알 수 없는 오류가 발생했습니다.';
  const lower = message.toLowerCase();
  if (lower.includes('invalid request body')) return '입력값 형식이 올바르지 않습니다.';
  if (lower.includes('name already exists')) return '같은 이름의 키가 이미 존재합니다.';
  if (lower.includes('failed to create keypair')) return '공개키 등록 중 문제가 발생했습니다.';
  if (lower.includes('failed to connect to cloud')) return '클라우드 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  if (lower.includes('proxy failed') || lower.includes('failed to fetch')) return '백엔드에 연결하지 못했습니다.';
  return message;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createDemoKeypair(payload) {
  return {
    name: payload.name,
    fingerprint: 'aa:bb:cc:dd:11:22:33:44',
    public_key: payload.public_key,
  };
}

function createDemoInstance(payload) {
  const now = new Date().toISOString();
  return {
    id: `demo-${Math.random().toString(36).slice(2, 10)}`,
    tenant_id: 'demo-project',
    user_id: state.session?.id || 'demo-user',
    name: payload.name,
    updated: now,
    created: now,
    hostid: 'demo-host',
    status: 'BUILD',
    progress: 0,
    accessIPv4: '',
    accessIPv6: '',
    flavor: { id: payload.flavor_id },
    addresses: {},
    metadata: {},
    links: [],
    key_name: state.keypairStatus.response?.name || '',
    adminPass: '',
    security_groups: [],
    'os-extended-volumes:volumes_attached': [],
    fault: null,
    tags: null,
    server_groups: null,
  };
}

function buildInventoryRecord(payload, response, mode) {
  return {
    id: response.id || `local-${Math.random().toString(36).slice(2, 10)}`,
    name: response.name || payload.name,
    status: response.status || (mode === 'live' ? 'BUILD' : 'ACTIVE'),
    created: response.created || new Date().toISOString(),
    updated: response.updated || response.created || new Date().toISOString(),
    flavorId: response.flavor?.id || payload.flavor_id,
    imageId: payload.image_id,
    networkId: payload.network_id || '',
    keyName: state.keypairStatus.response?.name || '',
    mode,
    source: mode === 'live' ? 'local-live' : 'mock-created',
    note: state.draft.description.trim(),
  };
}

async function handleKeypairRegistration() {
  const name = state.draft.keypairName.trim();
  const publicKey = state.draft.publicKey.trim();

  if (name.length < 2) {
    state.keypairStatus = { state: 'error', message: '키 이름은 2자 이상 입력해 주세요.', response: null };
    render();
    return;
  }

  if (!validatePublicKey(publicKey)) {
    state.keypairStatus = { state: 'error', message: 'OpenSSH 형식의 공개키를 입력해 주세요.', response: null };
    render();
    return;
  }

  state.keypairStatus = { state: 'saving', message: '공개키를 등록하는 중입니다.', response: null };
  render();

  const payload = { name, public_key: publicKey };

  if (state.connectionMode === 'demo') {
    await wait(240);
    state.keypairStatus = {
      state: 'demo',
      message: '데모 모드에서 등록을 시뮬레이션했습니다. 실제 백엔드에는 저장되지 않았습니다.',
      response: createDemoKeypair(payload),
    };
    render();
    return;
  }

  try {
    const response = await apiRequest('/api/v1/access/keypairs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    state.keypairStatus = { state: 'saved', message: '공개키 등록이 완료되었습니다.', response };
  } catch (error) {
    state.keypairStatus = { state: 'error', message: translateError(error.message), response: null };
  }

  render();
}

async function handleCreateInstance() {
  const payload = buildPayload();
  const sections = getSectionStates();

  if (!sections.review.valid) {
    state.creationStatus = { state: 'error', message: '필수 입력을 확인한 뒤 다시 생성해 주세요.' };
    render();
    return;
  }

  state.creationStatus = { state: 'saving', message: '인스턴스 생성 요청을 보내는 중입니다.' };
  render();

  if (state.connectionMode === 'demo') {
    await wait(420);
    const response = createDemoInstance(payload);
    const record = buildInventoryRecord(payload, response, 'demo');
    upsertInstance(record);
    state.result = { type: 'success', mode: 'demo', request: payload, response, instanceId: record.id };
    persistResult();
    state.creationStatus = { state: 'idle', message: '' };
    navigate('/instances/create/result');
    return;
  }

  try {
    const response = await apiRequest('/api/v1/compute/instances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const record = buildInventoryRecord(payload, response, 'live');
    upsertInstance(record);
    state.result = { type: 'success', mode: 'live', request: payload, response, instanceId: record.id };
    persistResult();
    state.creationStatus = { state: 'idle', message: '' };
    navigate('/instances/create/result');
  } catch (error) {
    state.result = { type: 'error', mode: 'live', request: payload, error: translateError(error.message), instanceId: null };
    persistResult();
    state.creationStatus = { state: 'error', message: translateError(error.message) };
    navigate('/instances/create/result');
  }
}

function disposeTerminalRuntime() {
  if (state.terminalReconnectTimer) {
    window.clearTimeout(state.terminalReconnectTimer);
    state.terminalReconnectTimer = null;
  }
  if (state.terminalRuntime?.intervalId) {
    window.clearInterval(state.terminalRuntime.intervalId);
  }
  if (state.terminalRuntime?.resizeHandler) {
    window.removeEventListener('resize', state.terminalRuntime.resizeHandler);
  }
  if (state.terminalRuntime?.onDataDispose) {
    state.terminalRuntime.onDataDispose.dispose();
  }
  if (state.terminalRuntime?.terminal) {
    state.terminalRuntime.terminal.dispose();
  }
  state.terminalRuntime = null;
}

function updateTerminalFullscreenState() {
  const shell = document.querySelector('.terminal-shell');
  const workspace = document.querySelector('.workspace-terminal');
  const toggle = document.querySelector('[data-action="terminal-fullscreen"]');

  state.terminalFullscreen = Boolean(
    document.fullscreenElement &&
    shell &&
    (document.fullscreenElement === shell || shell.contains(document.fullscreenElement)),
  );

  shell?.classList.toggle('is-fullscreen', state.terminalFullscreen);
  workspace?.classList.toggle('terminal-fullscreen', state.terminalFullscreen);

  if (toggle) {
    toggle.textContent = state.terminalFullscreen ? 'Exit fullscreen' : 'Fullscreen';
  }

  state.terminalRuntime?.fitAddon?.fit();

  if (state.route.name === ROUTE_NAMES.terminal && state.terminalRuntime) {
    scheduleTerminalReconnect();
  }
}

function scheduleTerminalReconnect() {
  if (state.terminalReconnectTimer) {
    window.clearTimeout(state.terminalReconnectTimer);
  }

  state.terminalReconnectTimer = window.setTimeout(() => {
    state.terminalReconnectTimer = null;
    setupTerminalIfNeeded(true);
  }, 90);
}

async function setupTerminalIfNeeded(force = false) {
  if (state.route.name !== ROUTE_NAMES.terminal) {
    disposeTerminalRuntime();
    return;
  }

  const instance = getInstanceById(state.route.instanceId);
  const host = document.querySelector('#terminal-host');
  if (!instance || !host) {
    return;
  }

  if (!force && state.terminalRuntime?.instanceId === instance.id) {
    return;
  }

  disposeTerminalRuntime();

  if (!state.terminalModules) {
    const [{ Terminal }, { FitAddon }] = await Promise.all([
      import('/node_modules/@xterm/xterm/lib/xterm.mjs'),
      import('/node_modules/@xterm/addon-fit/lib/addon-fit.mjs'),
    ]);
    state.terminalModules = { Terminal, FitAddon };
  }

  const { Terminal, FitAddon } = state.terminalModules;
  const terminal = new Terminal({
    cursorBlink: true,
    convertEol: true,
    fontSize: 13,
    letterSpacing: 0.2,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    theme: {
      background: '#0d1628',
      foreground: '#d6e2ff',
      cursor: '#d6e2ff',
      black: '#101828',
      blue: '#2554ff',
      green: '#0db07d',
      red: '#ff6b5c',
      yellow: '#e6b450',
      white: '#eef3ff',
      brightBlack: '#667085',
      brightBlue: '#7da2ff',
      brightGreen: '#5ed6af',
      brightWhite: '#ffffff',
    },
  });

  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  host.innerHTML = '';
  terminal.open(host);
  fitAddon.fit();

  const runtime = {
    instanceId: instance.id,
    terminal,
    fitAddon,
    commandBuffer: '',
    connected: false,
    intervalId: null,
    onDataDispose: null,
    resizeHandler: () => fitAddon.fit(),
  };

  window.addEventListener('resize', runtime.resizeHandler);
  runtime.onDataDispose = terminal.onData((data) => handleTerminalInput(runtime, data, instance));
  state.terminalRuntime = runtime;

  await bootMockTerminal(runtime, instance);
}

async function bootMockTerminal(runtime, instance) {
  const term = runtime.terminal;
  const lines = [
    '\u001B[1;34mRCP terminal\u001B[0m',
    `target: ${instance.name} (${instance.id})`,
    runtimeBanner(instance),
    'transport: xterm session (websocket backend not implemented yet)',
    'type \"help\" to see supported commands.',
    '',
  ];

  for (const line of lines) {
    term.writeln(line);
    await wait(80);
  }

  runtime.connected = true;
  renderPrompt(runtime, instance);
}

function runtimeBanner(instance) {
  return instance.mode === 'live'
    ? 'backend: live create path verified'
    : 'backend: local fallback mode';
}

function renderPrompt(runtime, instance) {
  runtime.commandBuffer = '';
  runtime.terminal.write(`\r\n\u001B[1;32m${state.session?.id || 'operator'}@${instance.name}\u001B[0m:\u001B[1;34m~\u001B[0m$ `);
}

function writeTerminalResponse(runtime, response) {
  for (const line of response) {
    runtime.terminal.writeln(line);
  }
}

function handleTerminalInput(runtime, data, instance) {
  const term = runtime.terminal;

  if (!runtime.connected) return;

  switch (data) {
    case '\r': {
      const command = runtime.commandBuffer.trim();
      term.write('\r\n');
      runMockCommand(runtime, command, instance);
      return;
    }
    case '\u007f': {
      if (runtime.commandBuffer.length > 0) {
        runtime.commandBuffer = runtime.commandBuffer.slice(0, -1);
        term.write('\b \b');
      }
      return;
    }
    case '\u0003': {
      term.write('^C');
      renderPrompt(runtime, instance);
      return;
    }
    default: {
      if (data >= ' ') {
        runtime.commandBuffer += data;
        term.write(data);
      }
    }
  }
}

function runMockCommand(runtime, command, instance) {
  const normalized = command.trim();

  if (!normalized) {
    renderPrompt(runtime, instance);
    return;
  }

  const responses = {
    help: [
      'available commands:',
      '  help, ls, pwd, whoami, hostname, ip addr, cat instance.txt, uptime, clear, exit',
    ],
    ls: ['instance.txt  logs/  tmp/'],
    pwd: ['/home/operator'],
    whoami: [state.session?.id || 'operator'],
    hostname: [instance.name],
    'ip addr': [
      'eth0: inet 10.10.0.24/24 scope global eth0',
      instance.networkId ? `network-id: ${instance.networkId}` : 'network-id: not attached',
    ],
    'cat instance.txt': [
      `name=${instance.name}`,
      `id=${instance.id}`,
      `status=${instance.status}`,
      `flavor=${instance.flavorId}`,
      `image=${instance.imageId}`,
      `source=${instance.source}`,
      `key=${instance.keyName || 'none'}`,
    ],
    uptime: [' 20:53:12 up 3 days,  2 users,  load average: 0.06, 0.08, 0.10'],
  };

  if (normalized === 'clear') {
    runtime.terminal.clear();
    renderPrompt(runtime, instance);
    return;
  }

  if (normalized === 'exit') {
    runtime.terminal.writeln('closing session...');
    window.setTimeout(() => navigate('/instances'), 180);
    return;
  }

  if (responses[normalized]) {
    writeTerminalResponse(runtime, responses[normalized]);
    renderPrompt(runtime, instance);
    return;
  }

  runtime.terminal.writeln(`command not found: ${normalized}`);
  runtime.terminal.writeln('type "help" to inspect the session.');
  renderPrompt(runtime, instance);
}

function render() {
  const isAuthRoute =
    state.route.name === ROUTE_NAMES.login ||
    state.route.name === ROUTE_NAMES.signup ||
    state.route.name === ROUTE_NAMES.changes;

  if (!state.session && !isAuthRoute) {
    state.pendingRoutePath = state.route.path;
    navigate('/login', { replace: true, instant: true });
    return;
  }

  if (state.route.name !== ROUTE_NAMES.terminal) {
    disposeTerminalRuntime();
  }

  if (state.route.name === ROUTE_NAMES.login) {
    app.innerHTML = renderLoginView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.signup) {
    app.innerHTML = renderSignupView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.changes) {
    app.innerHTML = renderChangesView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.storage) {
    app.innerHTML = renderStorageView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.instances) {
    app.innerHTML = renderInstancesView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.detail) {
    app.innerHTML = renderInstanceDetailView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.result) {
    app.innerHTML = renderResultView();
    return;
  }

  if (state.route.name === ROUTE_NAMES.terminal) {
    app.innerHTML = renderTerminalView();
    queueMicrotask(() => setupTerminalIfNeeded());
    return;
  }

  app.innerHTML = renderCreateView();
}

function renderTopbar(active) {
  const health = getAppHealth();
  const computeActive =
    active === ROUTE_NAMES.instances ||
    active === ROUTE_NAMES.create ||
    active === ROUTE_NAMES.detail ||
    active === ROUTE_NAMES.result ||
    active === ROUTE_NAMES.terminal;
  return `
    <header class="topbar">
      <div class="brand">
        <img class="brand-logo" src="${BRAND_ASSETS.light}" alt="RETURN logo" />
        <div>
          <strong>Return Cloud Platform</strong>
          <span>${active === ROUTE_NAMES.storage ? 'Storage' : 'Compute'}</span>
        </div>
      </div>
      <nav class="topbar-nav" aria-label="Primary">
        <button class="nav-button ${computeActive ? 'active' : ''}" data-action="go-compute">Compute</button>
        <button class="nav-button ${active === ROUTE_NAMES.storage ? 'active' : ''}" data-action="go-storage">Storage</button>
      </nav>
      <div class="topbar-tools">
        <span class="status-pill ${health.tone}">${health.label}</span>
        <span class="operator-label">${escapeHtml(state.session?.name || '')}</span>
        <button class="ghost-button" data-action="logout">Sign out</button>
      </div>
    </header>
  `;
}

function renderLoginStage() {
  const builtInUsers = mockUsers;
  const customUsers = state.customMockUsers;

  return `
    <div class="auth-panel auth-panel-compact">
      <div class="auth-copy">
        <h2>로그인</h2>
        <p class="muted">계정을 선택해서 바로 들어갑니다.</p>
      </div>

      <div class="roster-group">
        <div class="roster roster-tight">
          ${builtInUsers
            .map(
              (user) => `
                <button class="auth-account" data-action="login" data-user-id="${user.id}" data-ui="login-${user.id}">
                  <strong>${user.name}</strong>
                  <small>${user.subtitle}</small>
                </button>
              `,
            )
            .join('')}
        </div>
      </div>

      <div class="roster-group">
        <div class="group-label-row">
          <p class="group-label">가입한 계정</p>
          ${customUsers.length ? `<span class="muted tiny">${customUsers.length}</span>` : ''}
        </div>
        ${customUsers.length
          ? `
            <div class="roster roster-tight">
              ${customUsers
                .map(
                  (user) => `
                    <button class="auth-account auth-account-custom" data-action="login" data-user-id="${user.id}">
                      <strong>${user.name}</strong>
                      <small>@${user.id}</small>
                    </button>
                  `,
                )
                .join('')}
            </div>
          `
          : `
            <div class="auth-empty-inline">
              <span>가입한 계정이 없습니다</span>
            </div>
          `}
      </div>
    </div>
  `;
}

function renderSignupStage() {
  return `
    <div class="auth-panel auth-panel-compact">
      <div class="auth-copy">
        <h2>회원가입</h2>
        <p class="muted">create account</p>
      </div>

      <div class="signup-grid signup-grid-compact">
        <label class="field">
          <span>이름</span>
          <input name="signupName" type="text" placeholder="Kim Return" value="${escapeHtml(state.signupForm.name)}" />
        </label>

        <label class="field">
          <span>아이디</span>
          <input name="signupHandle" type="text" placeholder="kim-return" value="${escapeHtml(state.signupForm.handle)}" />
        </label>

        <label class="field">
          <span>계정 유형</span>
          <select name="signupRolePreset">
            <option value="student" ${state.signupForm.rolePreset === 'student' ? 'selected' : ''}>Default</option>
            <option value="admin" ${state.signupForm.rolePreset === 'admin' ? 'selected' : ''}>Alternate</option>
          </select>
        </label>

        <label class="field field-wide">
          <span>메모</span>
          <textarea name="signupSubtitle" rows="3" placeholder="예: 과제 실습용 인스턴스를 자주 생성하는 사용자">${escapeHtml(state.signupForm.subtitle)}</textarea>
        </label>
      </div>

      <div class="action-row auth-actions">
        <button class="primary-button auth-submit" data-action="create-mock-user">계정 만들기</button>
        ${state.authMessage ? `<p class="inline-status ${state.authMessage.type}">${escapeHtml(state.authMessage.text)}</p>` : ''}
      </div>
    </div>
  `;
}

function renderChangesStage() {
  return `
    <div class="auth-panel auth-panel-compact">
      <div class="auth-copy">
        <h2>수정사항</h2>
        <p class="muted">recent updates</p>
      </div>

      <div class="release-list">
        ${releaseNotes
          .map(
            (note) => `
              <article class="release-item">
                <div class="release-head">
                  <span class="release-version">${note.version}</span>
                  <strong>${note.title}</strong>
                </div>
                <p>${note.body}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderLoginView() {
  return `
    <div class="page page-login shell-enter">
      <main class="auth-shell">
        <section class="auth-brand-panel">
          <div class="auth-brand-copy">
            <span class="auth-brand-name">
              <span>Return</span>
              <span>Cloud</span>
              <span>Platform</span>
            </span>
          </div>
        </section>

        <section class="auth-card" aria-label="Auth entry">
          <div class="auth-card-head">
            <div class="auth-card-copy">
              <span class="auth-kicker">Return Cloud Platform</span>
              <strong>Sign in</strong>
            </div>
            <div class="auth-header-actions">
              <button class="ghost-button ghost-button-small" data-action="go-signup">회원가입</button>
              <button class="ghost-button ghost-button-small" data-action="go-changes">What changed</button>
            </div>
          </div>

          <div class="auth-stage auth-stage-tight">
            <div class="auth-login-box">
              <div class="auth-copy">
                <h2>로그인</h2>
                <p class="muted">경희대 Google 계정으로 계속하세요.</p>
              </div>

              <div class="auth-note">
                <strong>@khu.ac.kr</strong>
                <span>경희대 계정으로만 접근할 수 있습니다.</span>
              </div>

              <button class="oauth-button" data-action="google-login" data-ui="google-login">
                <span class="oauth-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z" fill="#4285F4"/>
                    <path d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z" fill="#34A853"/>
                    <path d="M6.25 13.73A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.25-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.09 4.37l3.16-2.64Z" fill="#FBBC05"/>
                    <path d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.07 2.98 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64c.81-2.42 3.08-4.22 5.75-4.22Z" fill="#EA4335"/>
                  </svg>
                </span>
                <span>Google로 계속하기</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderSignupView() {
  return `
    <div class="page page-login shell-enter">
      <main class="auth-shell">
        <section class="auth-brand-panel">
          <div class="auth-brand-copy">
            <span class="auth-brand-name">
              <span>Return</span>
              <span>Cloud</span>
              <span>Platform</span>
            </span>
          </div>
        </section>

        <section class="auth-card" aria-label="Signup entry">
          <div class="auth-card-head">
            <div class="auth-card-copy">
              <span class="auth-kicker">Return Cloud Platform</span>
              <strong>Create account</strong>
            </div>
            <div class="auth-header-actions">
              <button class="ghost-button ghost-button-small" data-action="go-login">로그인</button>
              <button class="ghost-button ghost-button-small" data-action="go-changes">What changed</button>
            </div>
          </div>

          <div class="auth-stage auth-stage-tight">
            <div class="auth-login-box">
              <div class="auth-copy">
                <h2>회원가입</h2>
                <p class="muted">경희대 Google 계정으로 가입을 시작하세요.</p>
              </div>

              <div class="auth-note">
                <strong>@khu.ac.kr</strong>
                <span>경희대 Google 계정 인증이 끝나면 바로 서비스에 연결됩니다.</span>
              </div>

              <button class="oauth-button" data-action="google-login" data-ui="google-signup">
                <span class="oauth-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z" fill="#4285F4"/>
                    <path d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z" fill="#34A853"/>
                    <path d="M6.25 13.73A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.25-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.09 4.37l3.16-2.64Z" fill="#FBBC05"/>
                    <path d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.07 2.98 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64c.81-2.42 3.08-4.22 5.75-4.22Z" fill="#EA4335"/>
                  </svg>
                </span>
                <span>Google로 가입하기</span>
              </button>

              <p class="auth-caption">가입 후 바로 로그인됩니다.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderChangesView() {
  return `
    <div class="page page-login shell-enter">
      <main class="auth-shell">
        <section class="auth-brand-panel">
          <div class="auth-brand-copy">
            <span class="auth-brand-name">
              <span>Return</span>
              <span>Cloud</span>
              <span>Platform</span>
            </span>
          </div>
        </section>

        <section class="auth-card" aria-label="Changes entry">
          <div class="auth-card-head">
            <div class="auth-card-copy">
              <span class="auth-kicker">Return Cloud Platform</span>
              <strong>What changed</strong>
            </div>
            <div class="auth-header-actions">
              <button class="ghost-button ghost-button-small" data-action="go-login">로그인</button>
              <button class="ghost-button ghost-button-small" data-action="go-signup">회원가입</button>
            </div>
          </div>

          <div class="auth-stage auth-stage-tight">
            <div class="auth-panel auth-panel-compact">
              <div class="auth-copy">
                <h2>What changed</h2>
                <p class="muted">최근 반영된 변경 사항입니다.</p>
              </div>

              <div class="release-list">
                ${releaseNotes
                  .map(
                    (note) => `
                      <article class="release-item">
                        <div class="release-head">
                          <span class="release-version">${note.version}</span>
                          <strong>${note.title}</strong>
                        </div>
                        <p>${note.body}</p>
                      </article>
                    `,
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderInstancesView() {
  ensureSelectedInstance();
  const visibleInstances = getVisibleInstances();
  if (visibleInstances.length && !visibleInstances.some((item) => item.id === state.selectedInstanceId)) {
    state.selectedInstanceId = visibleInstances[0].id;
    persistSelectedInstance();
  }
  const selectedInstance = visibleInstances.find((item) => item.id === state.selectedInstanceId) || getSelectedInstance();
  const health = getAppHealth();
  const activeCount = state.instances.filter((item) => String(item.status).toUpperCase() === 'ACTIVE').length;
  const buildCount = state.instances.filter((item) => String(item.status).toUpperCase() === 'BUILD').length;
  const errorCount = state.instances.filter((item) => statusTone(item.status) === 'error').length;

  return `
    <div class="page page-instances shell-enter">
      ${renderTopbar(ROUTE_NAMES.instances)}
      <main class="workspace workspace-list">
        <section class="workspace-main list-main">
          <section class="editor-section editor-section-flat">
            <div class="section-head section-head-tight">
              <div>
                <p class="eyebrow">Compute</p>
                <h2>Instances</h2>
                <p class="muted section-support">${getInstancesHealth()}</p>
              </div>
              <div class="section-head-meta">
                <div class="section-stats" aria-label="Inventory summary">
                  <div class="mini-stat">
                    <span>Visible</span>
                    <strong>${visibleInstances.length}</strong>
                  </div>
                  <div class="mini-stat">
                    <span>Total</span>
                    <strong>${state.instances.length}</strong>
                  </div>
                  <div class="mini-stat">
                    <span>Active</span>
                    <strong>${activeCount}</strong>
                  </div>
                </div>
                <button class="primary-button" data-action="go-create">Create new VM</button>
              </div>
            </div>

            <div class="inventory-toolbar">
              <label class="field inventory-search">
                <span>Search</span>
                <input name="instanceQuery" type="text" placeholder="Search instances" value="${escapeHtml(state.instanceQuery)}" />
              </label>
              <div class="toolbar-side">
                <div class="filter-row" aria-label="Instance status filters">
                  <button class="filter-chip ${state.instanceStatusFilter === 'all' ? 'active' : ''}" data-action="filter-instances" data-status="all">All ${state.instances.length}</button>
                  <button class="filter-chip ${state.instanceStatusFilter === 'active' ? 'active' : ''}" data-action="filter-instances" data-status="active">Active ${activeCount}</button>
                  <button class="filter-chip ${state.instanceStatusFilter === 'build' ? 'active' : ''}" data-action="filter-instances" data-status="build">Building ${buildCount}</button>
                </div>
                ${errorCount ? `<span class="toolbar-meta">Issues ${errorCount}</span>` : ''}
              </div>
            </div>

            <div class="table-frame">
              ${visibleInstances.length ? `
                <table class="flavor-table instance-table" data-ui="instance-table">
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
                    ${visibleInstances
                      .map((instance) => `
                        <tr class="${instance.id === state.selectedInstanceId ? 'selected' : ''}" data-action="select-instance" data-instance-id="${instance.id}">
                          <td>
                            <strong>${escapeHtml(instance.name)}</strong>
                            <small>${escapeHtml(getDisplayInstanceId(instance.id))}</small>
                          </td>
                          <td><span class="inline-badge ${statusTone(instance.status)}">${escapeHtml(instance.status)}</span></td>
                          <td>${escapeHtml(instance.flavorId)}</td>
                          <td>${escapeHtml(getInstanceSourceLabel(instance.source))}</td>
                          <td>${escapeHtml(humanizeDate(instance.created))}</td>
                          <td>
                            <button class="ghost-button ghost-button-small" data-action="open-terminal" data-instance-id="${instance.id}">Open</button>
                          </td>
                        </tr>
                      `)
                      .join('')}
                  </tbody>
                </table>
              ` : `
                <div class="empty-block">
                  <strong>일치하는 인스턴스가 없습니다.</strong>
                  <p>검색어 또는 상태 필터를 바꿔 보세요.</p>
                </div>
              `}
            </div>
          </section>
        </section>

        <aside class="workspace-summary list-detail">
          <div class="summary-headline summary-headline-compact">
            <div>
              <p class="eyebrow">Instance details</p>
              <h2>${escapeHtml(selectedInstance?.name || 'No selection')}</h2>
            </div>
            ${selectedInstance ? `<span class="inline-badge ${statusTone(selectedInstance.status)}">${escapeHtml(selectedInstance.status)}</span>` : ''}
          </div>
          ${selectedInstance ? `
            <dl class="summary-grid large">
              <div><dt>ID</dt><dd>${escapeHtml(getDisplayInstanceId(selectedInstance.id))}</dd></div>
              <div><dt>Flavor</dt><dd>${escapeHtml(selectedInstance.flavorId)}</dd></div>
              <div><dt>Image</dt><dd>${escapeHtml(selectedInstance.imageId)}</dd></div>
              <div><dt>Network</dt><dd>${escapeHtml(selectedInstance.networkId || 'Not set')}</dd></div>
              <div><dt>SSH key</dt><dd>${escapeHtml(selectedInstance.keyName || 'Not registered')}</dd></div>
              <div><dt>Mode</dt><dd>${escapeHtml(selectedInstance.mode)}</dd></div>
            </dl>
            <div class="summary-note">
              <strong>Note</strong>
              <p>${escapeHtml(selectedInstance.note || 'No note')}</p>
            </div>
            <div class="action-row compact sidebar-actions">
              <button class="primary-button" data-action="open-terminal" data-instance-id="${selectedInstance.id}">Open terminal</button>
              <button class="ghost-button" data-action="go-instance-detail" data-instance-id="${selectedInstance.id}">View details</button>
            </div>
          ` : `
            <p class="muted">표시할 인스턴스가 없습니다.</p>
          `}
        </aside>
      </main>
    </div>
  `;
}

function renderInstanceDetailView() {
  const instance = getInstanceById(state.route.instanceId);

  return `
    <div class="page page-instances shell-enter">
      ${renderTopbar(ROUTE_NAMES.detail)}
      <main class="workspace workspace-list">
        <section class="workspace-main list-main">
          <section class="editor-section editor-section-flat">
            <div class="section-head section-head-tight">
              <div>
                <p class="eyebrow">Compute</p>
                <h2>Instance details</h2>
                <p class="muted section-support">선택한 인스턴스의 속성과 접근 정보를 확인합니다.</p>
              </div>
              <div class="action-row compact">
                <button class="ghost-button" data-action="go-instances">Back to instances</button>
              </div>
            </div>

            ${instance ? `
              <div class="detail-page-grid">
                <section class="detail-page-main table-frame">
                  <div class="detail-page-header">
                    <div>
                      <p class="eyebrow">Instance</p>
                      <h2>${escapeHtml(instance.name)}</h2>
                    </div>
                    <span class="inline-badge ${statusTone(instance.status)}">${escapeHtml(instance.status)}</span>
                  </div>
                  <dl class="summary-grid large detail-grid">
                    <div><dt>ID</dt><dd>${escapeHtml(getDisplayInstanceId(instance.id))}</dd></div>
                    <div><dt>Flavor</dt><dd>${escapeHtml(instance.flavorId)}</dd></div>
                    <div><dt>Image</dt><dd>${escapeHtml(instance.imageId)}</dd></div>
                    <div><dt>Network</dt><dd>${escapeHtml(instance.networkId || 'Not set')}</dd></div>
                    <div><dt>SSH key</dt><dd>${escapeHtml(instance.keyName || 'Not registered')}</dd></div>
                    <div><dt>Mode</dt><dd>${escapeHtml(instance.mode)}</dd></div>
                    <div><dt>Created</dt><dd>${escapeHtml(humanizeDate(instance.created))}</dd></div>
                    <div><dt>Updated</dt><dd>${escapeHtml(humanizeDate(instance.updated))}</dd></div>
                  </dl>
                </section>

                <aside class="workspace-summary detail-side">
                  <div class="summary-headline">
                    <p class="eyebrow">Actions</p>
                    <h2>${escapeHtml(instance.name)}</h2>
                  </div>
                  <div class="summary-note">
                    <strong>Note</strong>
                    <p>${escapeHtml(instance.note || 'No note')}</p>
                  </div>
                  <div class="action-row compact sidebar-actions">
                    <button class="primary-button" data-action="open-terminal" data-instance-id="${instance.id}">Open terminal</button>
                    <button class="ghost-button" data-action="go-create">Create VM</button>
                  </div>
                </aside>
              </div>
            ` : `
              <div class="empty-block">
                <strong>인스턴스를 찾을 수 없습니다.</strong>
                <p>목록으로 돌아가 다른 인스턴스를 선택해 주세요.</p>
              </div>
            `}
          </section>
        </section>
      </main>
    </div>
  `;
}

function renderStorageView() {
  const selectedBucket = getSelectedBucket();

  return `
    <div class="page page-instances shell-enter">
      ${renderTopbar(ROUTE_NAMES.storage)}
      <main class="workspace workspace-list">
        <section class="workspace-main list-main">
          <section class="editor-section editor-section-flat">
            <div class="section-head section-head-tight">
              <div>
                <p class="eyebrow">Storage</p>
                <h2>Object Storage</h2>
                <p class="muted section-support">버킷과 오브젝트 저장 영역을 확인합니다.</p>
              </div>
            </div>

            <div class="table-frame">
              <table class="flavor-table instance-table" data-ui="storage-table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Class</th>
                    <th>Region</th>
                    <th>Objects</th>
                    <th>Size</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  ${storageBuckets
                    .map(
                      (bucket) => `
                        <tr class="${bucket.id === state.selectedBucketId ? 'selected' : ''}" data-action="select-bucket" data-bucket-id="${bucket.id}">
                          <td><strong>${escapeHtml(bucket.name)}</strong></td>
                          <td>${escapeHtml(bucket.class)}</td>
                          <td>${escapeHtml(bucket.region)}</td>
                          <td>${bucket.objects.toLocaleString('en-US')}</td>
                          <td>${escapeHtml(bucket.size)}</td>
                          <td>${escapeHtml(humanizeDate(bucket.updated))}</td>
                        </tr>
                      `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside class="workspace-summary list-detail">
          <div class="summary-headline summary-headline-compact">
            <div>
              <p class="eyebrow">Bucket details</p>
              <h2>${escapeHtml(selectedBucket?.name || 'No selection')}</h2>
            </div>
          </div>
          ${selectedBucket ? `
            <dl class="summary-grid large">
              <div><dt>Class</dt><dd>${escapeHtml(selectedBucket.class)}</dd></div>
              <div><dt>Region</dt><dd>${escapeHtml(selectedBucket.region)}</dd></div>
              <div><dt>Objects</dt><dd>${selectedBucket.objects.toLocaleString('en-US')}</dd></div>
              <div><dt>Size</dt><dd>${escapeHtml(selectedBucket.size)}</dd></div>
              <div><dt>Updated</dt><dd>${escapeHtml(humanizeDate(selectedBucket.updated))}</dd></div>
            </dl>
            <div class="summary-note">
              <strong>Note</strong>
              <p>${escapeHtml(selectedBucket.note)}</p>
            </div>
          ` : `<p class="muted">표시할 버킷이 없습니다.</p>`}
        </aside>
      </main>
    </div>
  `;
}

function renderCreateView() {
  const health = getAppHealth();
  const selectedFlavor = getSelectedFlavor();
  const imageTemplate = getSelectedImageTemplate();
  const networkTemplate = getSelectedNetworkTemplate();
  const sections = getSectionStates();
  const payload = buildPayload();
  const canCreate = sections.review.valid && state.creationStatus.state !== 'saving';

  return `
    <div class="page page-create shell-enter">
      ${renderTopbar(ROUTE_NAMES.create)}
      <main class="workspace">
        <aside class="workspace-rail">
          <div class="rail-intro">
            <p class="eyebrow">Compute</p>
            <h2>Create VM</h2>
            <p class="muted">필수 설정만 확인하고 바로 생성합니다.</p>
          </div>
          <nav class="section-rail" aria-label="Section navigation">
            ${sectionOrder
              .map((key, index) => {
                const section = sections[key];
                const tone = section.error ? 'error' : section.valid ? 'valid' : 'pending';
                return `
                  <button class="rail-link ${tone}" data-action="jump-section" data-target="${key}">
                    <span class="rail-num">0${index + 1}</span>
                    <span class="rail-copy">
                      <strong>${section.title}</strong>
                      <small>${section.error ? 'Needs attention' : section.valid ? 'Ready' : 'Incomplete'}</small>
                    </span>
                  </button>
                `;
              })
              .join('')}
          </nav>
        </aside>

        <section class="workspace-main">
          <section class="notice-strip create-strip ${health.tone}">
            <div>
              <strong>Compute / Create</strong>
              <p>${selectedFlavor ? `${selectedFlavor.name} 기준으로 인스턴스를 준비합니다.` : '인스턴스 생성 설정을 확인합니다.'}</p>
            </div>
            <ul>
              <li>${health.label}</li>
              <li>${state.draft.imageId ? 'Image ready' : 'Image required'}</li>
              <li>${state.keypairStatus.response?.name ? 'SSH ready' : 'SSH optional'}</li>
            </ul>
          </section>

          <section class="editor-section" id="basic">
            <div class="section-head">
              <div>
                <p class="eyebrow">01 · Basic</p>
                <h2>기본 정보</h2>
              </div>
              <p class="muted">이름과 메모를 정리합니다.</p>
            </div>
            <div class="field-grid">
              <label class="field">
                <span>VM name *</span>
                <input data-ui="vm-name" name="name" type="text" placeholder="lab-api-01" value="${escapeHtml(state.draft.name)}" />
                <small>${state.draft.name && !validateName(state.draft.name) ? '영문/숫자와 하이픈만 사용하고 2~32자를 권장합니다.' : '예: course-web-01, return-gpu-lab'}</small>
              </label>
              <label class="field field-wide">
                <span>Operator note</span>
                <textarea name="description" rows="3" placeholder="용도, 담당자, 수업명 등을 짧게 적습니다.">${escapeHtml(state.draft.description)}</textarea>
                <small>목록과 상세에서 같이 보입니다.</small>
              </label>
            </div>
          </section>

          <section class="editor-section" id="compute">
            <div class="section-head">
              <div>
                <p class="eyebrow">02 · Sizing</p>
                <h2>사양</h2>
              </div>
              <p class="muted">quota 기준으로 선택합니다.</p>
            </div>
            <div class="table-frame">
              ${renderFlavorTable(selectedFlavor)}
            </div>
          </section>

          <section class="editor-section" id="image-network">
            <div class="section-head">
              <div>
                <p class="eyebrow">03 · Image / Network</p>
                <h2>이미지 · 네트워크</h2>
              </div>
              <p class="muted">assist 또는 직접 입력으로 설정합니다.</p>
            </div>

            <div class="paired-blocks">
              <section class="line-block">
                <div class="line-block-head">
                  <div>
                    <strong>Image assist</strong>
                    <p class="muted">preset을 고르면 image ID를 채워 줍니다.</p>
                  </div>
                  <label class="switch">
                    <input type="checkbox" name="imageAssistEnabled" ${state.draft.imageAssistEnabled ? 'checked' : ''} />
                    <span>guided</span>
                  </label>
                </div>
                ${state.draft.imageAssistEnabled ? `
                  <label class="field">
                    <span>Image template</span>
                    <select data-ui="image-template" name="imageTemplate">
                      ${imageTemplates
                        .map((item) => `<option value="${item.key}" ${item.key === state.draft.imageTemplate ? 'selected' : ''}>${item.label}</option>`)
                        .join('')}
                    </select>
                    <small>${imageTemplate?.description || ''}</small>
                  </label>
                ` : ''}
                <label class="field">
                  <span>Image ID *</span>
                  <input data-ui="image-id" name="imageId" type="text" placeholder="image-uuid" value="${escapeHtml(state.draft.imageId)}" />
                  <small>실운영에서는 유효한 OpenStack image ID가 필요합니다.</small>
                </label>
              </section>

              <section class="line-block">
                <div class="line-block-head">
                  <div>
                    <strong>Network assist</strong>
                    <p class="muted">network는 선택값입니다. 비우면 payload에서 빠집니다.</p>
                  </div>
                  <label class="switch">
                    <input type="checkbox" name="networkAssistEnabled" ${state.draft.networkAssistEnabled ? 'checked' : ''} />
                    <span>guided</span>
                  </label>
                </div>
                ${state.draft.networkAssistEnabled ? `
                  <label class="field">
                    <span>Network template</span>
                    <select data-ui="network-template" name="networkTemplate">
                      ${networkTemplates
                        .map((item) => `<option value="${item.key}" ${item.key === state.draft.networkTemplate ? 'selected' : ''}>${item.label}</option>`)
                        .join('')}
                    </select>
                    <small>${networkTemplate?.description || ''}</small>
                  </label>
                ` : ''}
                <label class="field">
                  <span>Network ID</span>
                  <input data-ui="network-id" name="networkId" type="text" placeholder="optional network-uuid" value="${escapeHtml(state.draft.networkId)}" />
                  <small>비워두면 optional 값으로 처리됩니다.</small>
                </label>
              </section>
            </div>
          </section>

          <section class="editor-section" id="access">
            <div class="section-head">
              <div>
                <p class="eyebrow">04 · Access</p>
                <h2>접근</h2>
              </div>
              <p class="muted">SSH 키 등록은 선택입니다.</p>
            </div>

            <div class="field-grid field-grid-access">
              <label class="field">
                <span>KeyPair name</span>
                <input data-ui="keypair-name" name="keypairName" type="text" placeholder="return-lab-key" value="${escapeHtml(state.draft.keypairName)}" />
                <small>짧고 재사용 가능한 이름을 추천합니다.</small>
              </label>
              <label class="field field-wide">
                <span>Public key</span>
                <textarea data-ui="public-key" name="publicKey" rows="4" placeholder="ssh-ed25519 AAAA... user@example">${escapeHtml(state.draft.publicKey)}</textarea>
                <small>OpenSSH 형식을 그대로 붙여넣으세요.</small>
              </label>
            </div>

            <div class="action-row">
              <button class="primary-button secondary-tone" data-action="register-keypair" data-ui="register-key" ${state.keypairStatus.state === 'saving' ? 'disabled' : ''}>
                ${state.keypairStatus.state === 'saving' ? '등록 중...' : 'Register key'}
              </button>
              ${state.keypairStatus.message ? `<p class="inline-status ${state.keypairStatus.state}" aria-live="polite">${state.keypairStatus.message}</p>` : ''}
            </div>

            ${state.keypairStatus.response ? `
              <div class="receipt-bar" data-ui="key-receipt">
                <strong>${escapeHtml(state.keypairStatus.response.name)}</strong>
                <span>Fingerprint ${escapeHtml(state.keypairStatus.response.fingerprint || 'generated')}</span>
              </div>
            ` : ''}
          </section>

          <section class="editor-section" id="review">
            <div class="section-head">
              <div>
                <p class="eyebrow">05 · Review</p>
                <h2>검토</h2>
              </div>
              <p class="muted">생성 전에 최종 값을 확인합니다.</p>
            </div>

            <div class="review-layout">
              <div class="review-copy">
                <ul class="review-rows">
                  <li><strong>Name</strong><span>${escapeHtml(payload.name || '-')}</span></li>
                  <li><strong>Flavor</strong><span>${escapeHtml(selectedFlavor?.name || '-')}</span></li>
                  <li><strong>Resources</strong><span>${selectedFlavor ? `${selectedFlavor.vcpus} vCPU · ${formatRam(selectedFlavor.ram)} · ${selectedFlavor.disk} GB disk` : '-'}</span></li>
                  <li><strong>Image</strong><span>${escapeHtml(payload.image_id || '-')}</span></li>
                  <li><strong>Network</strong><span>${escapeHtml(payload.network_id || 'Not set')}</span></li>
                  <li><strong>SSH key</strong><span>${escapeHtml(state.keypairStatus.response?.name || 'Optional')}</span></li>
                </ul>
                ${state.creationStatus.message ? `<p class="inline-status ${state.creationStatus.state}" aria-live="polite">${state.creationStatus.message}</p>` : ''}
                <div class="action-row compact">
                  <button class="primary-button" data-action="create-instance" data-ui="create-vm" ${canCreate ? '' : 'disabled'}>
                    ${state.creationStatus.state === 'saving' ? 'Creating...' : 'Create instance'}
                  </button>
                  <button class="ghost-button" data-action="jump-section" data-target="basic">Back to edit</button>
                </div>
              </div>
              <pre class="code-block" data-ui="payload-preview">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
            </div>
          </section>
        </section>

        <aside class="workspace-summary">
          <div class="summary-headline">
            <p class="eyebrow">Create review</p>
            <h2 data-ui="summary-name">${escapeHtml(state.draft.name || 'Untitled VM')}</h2>
          </div>
          <dl class="summary-grid">
            <div><dt>Mode</dt><dd>${state.connectionMode === 'live' ? 'Live API' : 'Demo fallback'}</dd></div>
            <div><dt>Flavor</dt><dd>${escapeHtml(selectedFlavor?.name || 'Not selected')}</dd></div>
            <div><dt>Quota impact</dt><dd>${selectedFlavor ? `${selectedFlavor.vcpus} vCPU / ${formatRam(selectedFlavor.ram)}` : '-'}</dd></div>
            <div><dt>Max creatable</dt><dd>${selectedFlavor ? selectedFlavor.max_configurable : '-'}</dd></div>
            <div><dt>Image</dt><dd>${escapeHtml(state.draft.imageId || 'Required')}</dd></div>
            <div><dt>Network</dt><dd>${escapeHtml(state.draft.networkId || 'Optional')}</dd></div>
            <div><dt>SSH key</dt><dd>${escapeHtml(state.keypairStatus.response?.name || 'Not registered')}</dd></div>
          </dl>
          <div class="summary-checks" data-ui="summary-checks">
            ${sectionOrder
              .map((key) => {
                const section = sections[key];
                return `
                  <div class="check-row ${section.error ? 'error' : section.valid ? 'valid' : 'pending'}">
                    <span>${section.title}</span>
                    <strong>${section.error ? 'Fix' : section.valid ? 'Ready' : 'Pending'}</strong>
                  </div>
                `;
              })
              .join('')}
          </div>
          <div class="summary-note">
            <strong>Note</strong>
            <p>${escapeHtml(state.draft.description || 'No note')}</p>
          </div>
        </aside>
      </main>
    </div>
  `;
}

function renderFlavorTable(selectedFlavor) {
  if (state.flavorsStatus === 'loading') {
    return `
      <div class="skeleton-band" aria-hidden="true">
        <div></div><div></div><div></div>
      </div>
    `;
  }

  if (!state.flavors.length) {
    return `
      <div class="empty-block">
        <strong>사용 가능한 flavor가 없습니다.</strong>
        <p>현재 quota 기준으로 생성 가능한 사양이 없습니다.</p>
      </div>
    `;
  }

  return `
    <table class="flavor-table" data-ui="flavor-table">
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
        ${state.flavors
          .map((flavor, index) => {
            const disabled = (flavor.max_configurable || 0) === 0;
            const selected = selectedFlavor?.id === flavor.id;
            return `
              <tr class="${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-action="select-flavor" data-flavor-id="${flavor.id}">
                <td>
                  <strong>${escapeHtml(flavor.name)}</strong>
                  <small>${selected ? 'Selected' : disabled ? 'Unavailable' : 'Available now'}</small>
                </td>
                <td>${flavor.vcpus}</td>
                <td>${formatRam(flavor.ram)}</td>
                <td>${flavor.disk} GB</td>
                <td>${flavor.max_configurable}</td>
                <td>${getRecommendation(flavor, index)}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function renderResultView() {
  const result = state.result;

  if (!result) {
    return `
      <div class="page page-result shell-enter">
        ${renderTopbar(ROUTE_NAMES.result)}
        <main class="result-layout">
          <section class="result-hero error">
            <p class="eyebrow">No receipt</p>
            <h1>아직 생성 결과가 없습니다</h1>
            <p class="muted">새로운 VM 생성 흐름으로 돌아가서 payload를 확인한 뒤 다시 요청해 주세요.</p>
            <div class="action-row">
              <button class="primary-button" data-action="go-create">Go to create workspace</button>
            </div>
          </section>
        </main>
      </div>
    `;
  }

  const response = result.response || {};
  const inventoryInstance = result.instanceId ? getInstanceById(result.instanceId) : null;

  return `
    <div class="page page-result shell-enter">
      ${renderTopbar(ROUTE_NAMES.result)}
      <main class="result-layout">
        <section class="result-hero ${result.type === 'success' ? 'success' : 'error'}">
          <p class="eyebrow">${result.type === 'success' ? 'Request accepted' : 'Request failed'}</p>
          <h1>${result.type === 'success' ? '생성 요청이 접수되었습니다' : '생성 요청을 완료하지 못했습니다'}</h1>
          <p class="lead minor">${result.type === 'success' ? (result.mode === 'demo' ? '데모 모드에서 응답을 시뮬레이션했습니다.' : '백엔드 응답을 기준으로 receipt를 구성했습니다.') : escapeHtml(result.error || '알 수 없는 오류가 발생했습니다.')}</p>
          <div class="action-row">
            <button class="primary-button" data-action="go-instances">View instances</button>
            <button class="ghost-button" data-action="go-create">Create another VM</button>
            ${inventoryInstance ? `<button class="ghost-button" data-action="open-terminal" data-instance-id="${inventoryInstance.id}">Open terminal</button>` : ''}
          </div>
        </section>

        <section class="result-grid" data-ui="result-grid">
          <article class="result-pane">
            <p class="eyebrow">Receipt</p>
            <dl class="summary-grid large">
              <div><dt>ID</dt><dd>${escapeHtml(response.id || '-')}</dd></div>
              <div><dt>Name</dt><dd>${escapeHtml(response.name || result.request?.name || '-')}</dd></div>
              <div><dt>Status</dt><dd>${escapeHtml(response.status || (result.type === 'success' ? 'BUILD' : '-'))}</dd></div>
              <div><dt>Created</dt><dd>${escapeHtml(humanizeDate(response.created))}</dd></div>
              <div><dt>Flavor</dt><dd>${escapeHtml(response.flavor?.id || result.request?.flavor_id || '-')}</dd></div>
              <div><dt>Network</dt><dd>${escapeHtml(result.request?.network_id || 'Not set')}</dd></div>
            </dl>
          </article>
          <article class="result-pane">
            <p class="eyebrow">Payload</p>
            <pre class="code-block">${escapeHtml(JSON.stringify(result.request || {}, null, 2))}</pre>
          </article>
          <article class="result-pane">
            <p class="eyebrow">Response</p>
            <pre class="code-block">${escapeHtml(JSON.stringify(result.type === 'success' ? response : { error: result.error || 'unknown error' }, null, 2))}</pre>
          </article>
        </section>
      </main>
    </div>
  `;
}

function renderTerminalView() {
  const instance = getInstanceById(state.route.instanceId);

  return `
    <div class="page page-terminal shell-enter">
      ${renderTopbar(ROUTE_NAMES.terminal)}
      <main class="workspace workspace-terminal ${state.terminalFullscreen ? 'terminal-fullscreen' : ''}">
        <section class="workspace-main terminal-main">
          <section class="terminal-shell ${state.terminalFullscreen ? 'is-fullscreen' : ''}">
            <div class="terminal-shell-head">
              <div class="terminal-heading">
                <div class="terminal-breadcrumb">
                  <button class="breadcrumb-link" data-action="go-compute">Compute</button>
                  <span>/</span>
                  <button class="breadcrumb-link" data-action="go-instances">Instances</button>
                  <span>/</span>
                  <strong>${escapeHtml(instance?.name || 'Unknown instance')}</strong>
                </div>
                <h2>${escapeHtml(instance?.name || 'Unknown instance')}</h2>
              </div>
              <div class="action-row compact">
                <button class="ghost-button" data-action="terminal-fullscreen">${state.terminalFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button>
                <button class="ghost-button" data-action="terminal-clear">Clear</button>
                <button class="ghost-button" data-action="terminal-reconnect">Reconnect</button>
                <button class="ghost-button" data-action="go-instances">Back to list</button>
              </div>
            </div>
            ${instance ? `<div id="terminal-host" class="terminal-host" data-ui="terminal-host"></div>` : '<p class="muted">선택한 인스턴스를 찾을 수 없습니다.</p>'}
          </section>
        </section>

        <aside class="workspace-summary terminal-detail">
          <div class="summary-headline">
            <p class="eyebrow">Instance</p>
            <h2>${escapeHtml(instance?.name || 'No instance')}</h2>
          </div>
          ${instance ? `
            <dl class="summary-grid large">
              <div><dt>ID</dt><dd>${escapeHtml(getDisplayInstanceId(instance.id))}</dd></div>
              <div><dt>Status</dt><dd><span class="inline-badge ${statusTone(instance.status)}">${escapeHtml(instance.status)}</span></dd></div>
              <div><dt>Flavor</dt><dd>${escapeHtml(instance.flavorId)}</dd></div>
              <div><dt>Network</dt><dd>${escapeHtml(instance.networkId || 'Not set')}</dd></div>
              <div><dt>SSH key</dt><dd>${escapeHtml(instance.keyName || 'Not set')}</dd></div>
            </dl>
            <div class="summary-note">
              <strong>Access</strong>
              <p>Browser terminal</p>
            </div>
            <div class="command-list">
              <strong>Commands</strong>
              <ul>
                <li><code>help</code></li>
                <li><code>cat instance.txt</code></li>
                <li><code>ip addr</code></li>
                <li><code>uptime</code></li>
              </ul>
            </div>
          ` : `
            <p class="muted">선택한 인스턴스를 찾을 수 없습니다.</p>
          `}
        </aside>
      </main>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function syncAssistFields(changedName, value, checked) {
  if (changedName === 'imageAssistEnabled') {
    state.draft.imageAssistEnabled = checked;
    if (checked) {
      state.draft.imageId = getSelectedImageTemplate()?.id || imageTemplates[0].id;
    }
    return;
  }

  if (changedName === 'networkAssistEnabled') {
    state.draft.networkAssistEnabled = checked;
    if (checked) {
      state.draft.networkId = getSelectedNetworkTemplate()?.id || networkTemplates[0].id;
    }
    return;
  }

  if (changedName === 'imageTemplate') {
    state.draft.imageTemplate = value;
    if (state.draft.imageAssistEnabled) {
      state.draft.imageId = imageTemplates.find((item) => item.key === value)?.id || '';
    }
    return;
  }

  if (changedName === 'networkTemplate') {
    state.draft.networkTemplate = value;
    if (state.draft.networkAssistEnabled) {
      state.draft.networkId = networkTemplates.find((item) => item.key === value)?.id || '';
    }
  }
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'go-login') {
    navigate('/login');
    return;
  }

  if (action === 'go-signup') {
    navigate('/signup');
    return;
  }

  if (action === 'go-changes') {
    navigate('/changes');
    return;
  }

  if (action === 'google-login') {
    state.session = GOOGLE_PREVIEW_USER;
    writeStorage(STORAGE_KEYS.session, GOOGLE_PREVIEW_USER);
    state.keypairStatus = { state: 'idle', message: '', response: null };
    state.creationStatus = { state: 'idle', message: '' };
    state.authMessage = null;
    const nextPath = state.pendingRoutePath || '/compute';
    state.pendingRoutePath = null;
    navigate(nextPath, { replace: true });
    return;
  }

  if (action === 'login') {
    const selected = getAuthUsers().find((item) => item.id === target.dataset.userId);
    if (!selected) return;
    state.session = selected;
    writeStorage(STORAGE_KEYS.session, selected);
    state.keypairStatus = { state: 'idle', message: '', response: null };
    state.creationStatus = { state: 'idle', message: '' };
    state.authMessage = null;
    const nextPath = state.pendingRoutePath || '/compute';
    state.pendingRoutePath = null;
    navigate(nextPath, { replace: true });
    return;
  }

  if (action === 'create-mock-user') {
    const name = state.signupForm.name.trim();
    const handle = normalizeHandle(state.signupForm.handle || state.signupForm.name);
    const preset = getRolePresetMeta(state.signupForm.rolePreset);

    if (name.length < 2) {
      state.authMessage = { type: 'error', text: '이름은 2자 이상 입력해 주세요.' };
      render();
      return;
    }

    if (!/^[a-z0-9-]{2,24}$/.test(handle)) {
      state.authMessage = { type: 'error', text: 'handle은 영문 소문자, 숫자, 하이픈 기준 2~24자여야 합니다.' };
      render();
      return;
    }

    if (getAuthUsers().some((item) => item.id === handle)) {
      state.authMessage = { type: 'error', text: '같은 handle의 계정이 이미 있습니다.' };
      render();
      return;
    }

    const nextUser = {
      id: handle,
      name,
      role: preset.role,
      subtitle: state.signupForm.subtitle.trim() || preset.subtitle,
      source: 'custom-mock',
    };

    state.customMockUsers = [...state.customMockUsers, nextUser];
    persistAuthUsers();
    state.signupForm = defaultSignupForm();
    state.authMessage = { type: 'saved', text: `${nextUser.name} 계정을 만들었고 바로 로그인합니다.` };
    state.session = nextUser;
    writeStorage(STORAGE_KEYS.session, nextUser);
    const nextPath = state.pendingRoutePath || '/compute';
    state.pendingRoutePath = null;
    navigate(nextPath, { replace: true });
    return;
  }

  if (action === 'logout') {
    localStorage.removeItem(STORAGE_KEYS.session);
    state.session = null;
    state.pendingRoutePath = null;
    state.authMessage = null;
    navigate('/login', { replace: true });
    return;
  }

  if (action === 'go-create') {
    navigate('/compute/create');
    return;
  }

  if (action === 'go-compute') {
    navigate('/compute');
    return;
  }

  if (action === 'go-storage') {
    navigate('/storage');
    return;
  }

  if (action === 'go-instances') {
    navigate('/compute');
    return;
  }

  if (action === 'jump-section') {
    document.getElementById(target.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (action === 'select-flavor') {
    const flavor = state.flavors.find((item) => item.id === target.dataset.flavorId);
    if (!flavor || flavor.max_configurable === 0) return;
    state.draft.selectedFlavorId = flavor.id;
    persistDraft();
    render();
    return;
  }

  if (action === 'register-keypair') {
    await handleKeypairRegistration();
    return;
  }

  if (action === 'create-instance') {
    await handleCreateInstance();
    return;
  }

  if (action === 'select-instance') {
    state.selectedInstanceId = target.dataset.instanceId;
    persistSelectedInstance();
    render();
    return;
  }

  if (action === 'go-instance-detail') {
    const instanceId = target.dataset.instanceId || state.selectedInstanceId;
    if (!instanceId) return;
    state.selectedInstanceId = instanceId;
    persistSelectedInstance();
    navigate(`/compute/instances/${encodeURIComponent(instanceId)}`);
    return;
  }

  if (action === 'select-bucket') {
    state.selectedBucketId = target.dataset.bucketId;
    persistSelectedBucket();
    render();
    return;
  }

  if (action === 'filter-instances') {
    state.instanceStatusFilter = target.dataset.status || 'all';
    render();
    return;
  }

  if (action === 'open-terminal') {
    const instanceId = target.dataset.instanceId || state.selectedInstanceId;
    if (!instanceId) return;
    state.selectedInstanceId = instanceId;
    persistSelectedInstance();
    navigate(`/compute/instances/${encodeURIComponent(instanceId)}/terminal`);
    return;
  }

  if (action === 'terminal-clear') {
    state.terminalRuntime?.terminal?.clear();
    return;
  }

  if (action === 'terminal-fullscreen') {
    const shell = document.querySelector('.terminal-shell');
    if (!shell) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      shell.requestFullscreen?.();
    }
    return;
  }

  if (action === 'terminal-reconnect') {
    disposeTerminalRuntime();
    setupTerminalIfNeeded();
    return;
  }
});

document.addEventListener('input', (event) => {
  const input = event.target;
  const { name, type } = input;
  if (!name) return;

  if (name === 'signupName') {
    state.signupForm.name = input.value;
    state.authMessage = null;
    render();
    return;
  }

  if (name === 'signupHandle') {
    state.signupForm.handle = input.value;
    state.authMessage = null;
    render();
    return;
  }

  if (name === 'signupRolePreset') {
    state.signupForm.rolePreset = input.value;
    state.authMessage = null;
    render();
    return;
  }

  if (name === 'signupSubtitle') {
    state.signupForm.subtitle = input.value;
    state.authMessage = null;
    render();
    return;
  }

  if (name === 'instanceQuery') {
    state.instanceQuery = input.value;
    render();
    return;
  }

  if (type === 'checkbox') {
    syncAssistFields(name, null, input.checked);
  } else {
    state.draft[name] = input.value;
    syncAssistFields(name, input.value, false);
  }

  persistDraft();
  render();
});

(function boot() {
  document.addEventListener('fullscreenchange', updateTerminalFullscreenState);
  if (state.route.path !== window.location.pathname) {
    window.history.replaceState({}, '', state.route.path);
  }
  ensureSelectedInstance();
  render();
  if (state.route.name === ROUTE_NAMES.create && state.session) {
    ensureFlavorData();
  } else if (
    state.route.name !== ROUTE_NAMES.login &&
    state.route.name !== ROUTE_NAMES.signup &&
    state.route.name !== ROUTE_NAMES.changes &&
    state.session
  ) {
    ensureBackendHealth();
  }
})();
