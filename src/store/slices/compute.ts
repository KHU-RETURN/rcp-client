import type { StateCreator } from 'zustand';
import type {
  Flavor,
  Instance,
  KeypairStatus,
  CreationStatus,
  FlavorsStatus,
  InstanceStatusFilter,
  CreationResult,
} from '../../types';
import type { ConnectionSlice } from './connection';
import type { DraftSlice } from './draft';
import type { AuthSlice } from './auth';
import { rcpConfig } from '../../config';
import { demoFlavors, imageTemplates } from '../../constants';
import { sortFlavors, translateError } from '../../utils';
import { apiRequest } from '../../services/api';
import {
  registerKeypair,
  createInstance,
  fetchInstances as fetchComputeInstances,
  fetchInstanceById as fetchComputeInstanceById,
} from '../../services/compute';
import { buildInventoryRecord } from '../../services/demo';

export interface ComputeSlice {
  flavors: Flavor[];
  flavorsStatus: FlavorsStatus;
  instances: Instance[];
  selectedInstanceId: string | null;
  instanceQuery: string;
  instanceStatusFilter: InstanceStatusFilter;
  keypairStatus: KeypairStatus;
  creationStatus: CreationStatus;
  result: CreationResult | null;

  ensureFlavorData: () => Promise<void>;
  ensureInstanceData: () => Promise<void>;
  ensureInstanceById: (id: string) => Promise<'ok' | 'not-found' | 'error' | 'skipped'>;
  upsertInstance: (instance: Instance) => void;
  setSelectedInstanceId: (id: string | null) => void;
  ensureSelectedInstance: () => void;
  setInstanceQuery: (query: string) => void;
  setInstanceStatusFilter: (filter: InstanceStatusFilter) => void;
  setKeypairStatus: (status: KeypairStatus) => void;
  setCreationStatus: (status: CreationStatus) => void;
  setResult: (result: CreationResult | null) => void;
  handleKeypairRegistration: () => Promise<void>;
  handleCreateInstance: () => Promise<string | null>;
  getSelectedFlavor: () => Flavor | null;
  deleteInstance: (id: string) => Promise<void>;
}

type ComputeSliceDeps = ComputeSlice & ConnectionSlice & DraftSlice & AuthSlice;

export const createComputeSlice: StateCreator<ComputeSliceDeps, [], [], ComputeSlice> = (set, get) => ({
  flavors: [],
  flavorsStatus: 'idle',
  instances: [],
  selectedInstanceId: null,
  instanceQuery: '',
  instanceStatusFilter: 'all',
  keypairStatus: { state: 'idle', message: '', response: null },
  creationStatus: { state: 'idle', message: '' },
  result: null,

  ensureFlavorData: async () => {
    const { flavorsStatus, connectionMode } = get();

    if (flavorsStatus === 'loading' || flavorsStatus === 'ready') return;

    set({ flavorsStatus: 'loading' });

    if (rcpConfig.demoMode === 'force' || get().connectionMode !== 'live') {
      set({ flavors: sortFlavors(demoFlavors), flavorsStatus: 'ready' });
      ensureDefaultFlavor(get);
      return;
    }

    try {
      const data = await apiRequest<Flavor[]>('/api/v1/compute/flavors?available=true');
      set({ flavors: sortFlavors(data), flavorsStatus: 'ready', connectionMode: 'live', connectionReason: '' });
    } catch {
      set({ flavors: sortFlavors(demoFlavors), flavorsStatus: 'ready' });
    }

    ensureDefaultFlavor(get);
    void connectionMode;
  },

  ensureInstanceData: async () => {
    if (rcpConfig.demoMode === 'force' || get().connectionMode !== 'live') return;

    try {
      const previousInstances = get().instances;
      const data = (await fetchComputeInstances()).map((instance) => {
        const previous = previousInstances.find((item) => item.id === instance.id);
        const wasActive = String(previous?.status ?? '').toUpperCase() === 'ACTIVE';
        const isActive = String(instance.status ?? '').toUpperCase() === 'ACTIVE';

        if (previous && !wasActive && isActive) {
          return { ...instance, updated: new Date().toISOString() };
        }

        return instance;
      });
      const selectedInstanceId = data.some((instance) => instance.id === get().selectedInstanceId)
        ? get().selectedInstanceId
        : (data[0]?.id ?? null);

      set({
        instances: data,
        selectedInstanceId,
        connectionMode: 'live',
        connectionReason: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load instances';
      set({ connectionMode: 'demo', connectionReason: translateError(message) });
    }
  },

  ensureInstanceById: async (id) => {
    if (rcpConfig.demoMode === 'force' || get().connectionMode !== 'live') return 'skipped';

    try {
      const instance = await fetchComputeInstanceById(id);
      set((state) => {
        const next = [...state.instances];
        const index = next.findIndex((i) => i.id === instance.id);
        if (index >= 0) next[index] = { ...next[index], ...instance };
        else next.unshift(instance);
        return { instances: next, connectionMode: 'live', connectionReason: '' };
      });
      return 'ok';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load instance';
      if (/404|not found/i.test(message)) return 'not-found';
      return 'error';
    }
  },

  upsertInstance: (instance) => {
    set((state) => {
      const next = [...state.instances];
      const index = next.findIndex((i) => i.id === instance.id);
      if (index >= 0) {
        next[index] = { ...next[index], ...instance };
      } else {
        next.unshift(instance);
      }
      return { instances: next, selectedInstanceId: instance.id };
    });
  },

  setSelectedInstanceId: (id) => {
    set({ selectedInstanceId: id });
  },

  ensureSelectedInstance: () => {
    const { instances, selectedInstanceId } = get();
    if (selectedInstanceId && instances.some((i) => i.id === selectedInstanceId)) return;
    set({ selectedInstanceId: instances[0]?.id ?? null });
  },

  setInstanceQuery: (query) => set({ instanceQuery: query }),
  setInstanceStatusFilter: (filter) => set({ instanceStatusFilter: filter }),
  setKeypairStatus: (status) => set({ keypairStatus: status }),
  setCreationStatus: (status) => set({ creationStatus: status }),
  setResult: (result) => set({ result }),

  handleKeypairRegistration: async () => {
    const { draft, connectionMode, setKeypairStatus } = get();
    setKeypairStatus({ state: 'saving', message: '공개키를 등록하는 중입니다.', response: null });

    const status = await registerKeypair(
      { name: draft.keypairName.trim(), public_key: draft.publicKey.trim() },
      connectionMode === 'demo',
    );
    setKeypairStatus(status);
  },

  handleCreateInstance: async () => {
    const { draft, connectionMode, session, keypairStatus, instances, upsertInstance, setCreationStatus, setResult } = get();
    const imageId = imageTemplates.find((item) => item.key === draft.imageTemplate)?.id ?? draft.imageId.trim();

    const payload = {
      name: draft.name.trim(),
      image_id: imageId,
      flavor_id: draft.selectedFlavorId,
      ...(keypairStatus.response?.name ? { key_name: keypairStatus.response.name } : {}),
    };

    setCreationStatus({ state: 'saving', message: '인스턴스 생성 요청을 보내는 중입니다.' });

    const isDemo = connectionMode === 'demo';
    const userId = session?.id ?? 'demo-user';
    const keypairName = keypairStatus.response?.name ?? '';

    const result = await createInstance(payload, isDemo, userId, keypairName, draft.description.trim());

    if (result.type === 'success' && result.response) {
      const record = buildInventoryRecord(payload, result.response, result.mode, keypairName, draft.description.trim());
      upsertInstance(record);
      setResult({ ...result, instanceId: record.id });
      setCreationStatus({ state: 'idle', message: '' });
      return '/compute/create/result';
    }

    setResult(result);
    setCreationStatus({ state: 'error', message: result.error ?? '생성 요청을 완료하지 못했습니다.' });
    void instances;
    return '/compute/create/result';
  },

  getSelectedFlavor: () => {
    const { flavors, draft } = get();
    return flavors.find((f) => f.id === draft.selectedFlavorId) ?? null;
  },

  deleteInstance: async (id) => {
    await apiRequest(`/api/v1/compute/instances/${encodeURIComponent(id)}`, { method: 'DELETE' });
    set((state) => ({
      instances: state.instances.filter((i) => i.id !== id),
      selectedInstanceId: state.selectedInstanceId === id
        ? (state.instances.find((i) => i.id !== id)?.id ?? null)
        : state.selectedInstanceId,
    }));
  },
});

function ensureDefaultFlavor(get: () => ComputeSliceDeps): void {
  const { flavors, draft, updateDraft } = get();
  if (draft.selectedFlavorId && flavors.some((f) => f.id === draft.selectedFlavorId)) return;
  const first = flavors.find((f) => f.max_configurable > 0) ?? flavors[0];
  if (first) {
    updateDraft({ selectedFlavorId: first.id });
  }
}
