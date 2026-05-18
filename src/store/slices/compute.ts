import type { StateCreator } from 'zustand';
import type {
  Flavor,
  Instance,
  KeypairStatus,
  CreationStatus,
  FlavorsStatus,
  InstanceStatusFilter,
} from '../../types';
import type { DraftSlice } from './draft';
import type { AuthSlice } from './auth';
import { imageTemplates } from '../../constants';
import { sortFlavors, translateError } from '../../utils';
import { apiRequest } from '../../services/api';
import {
  registerKeypair,
  createInstance,
  fetchInstances as fetchComputeInstances,
  fetchInstanceById as fetchComputeInstanceById,
} from '../../services/compute';

export interface ComputeSlice {
  flavors: Flavor[];
  flavorsStatus: FlavorsStatus;
  flavorsError: string;
  instances: Instance[];
  instancesError: string;
  selectedInstanceId: string | null;
  instanceQuery: string;
  instanceStatusFilter: InstanceStatusFilter;
  keypairStatus: KeypairStatus;
  creationStatus: CreationStatus;

  ensureFlavorData: () => Promise<void>;
  ensureInstanceData: () => Promise<void>;
  ensureInstanceById: (id: string) => Promise<'ok' | 'not-found' | 'error'>;
  upsertInstance: (instance: Instance) => void;
  setSelectedInstanceId: (id: string | null) => void;
  ensureSelectedInstance: () => void;
  setInstanceQuery: (query: string) => void;
  setInstanceStatusFilter: (filter: InstanceStatusFilter) => void;
  setKeypairStatus: (status: KeypairStatus) => void;
  setCreationStatus: (status: CreationStatus) => void;
  handleKeypairRegistration: () => Promise<void>;
  handleCreateInstance: () => Promise<string | null>;
  getSelectedFlavor: () => Flavor | null;
  deleteInstance: (id: string) => Promise<void>;
}

type ComputeSliceDeps = ComputeSlice & DraftSlice & AuthSlice;

export const createComputeSlice: StateCreator<ComputeSliceDeps, [], [], ComputeSlice> = (set, get) => ({
  flavors: [],
  flavorsStatus: 'idle',
  flavorsError: '',
  instances: [],
  instancesError: '',
  selectedInstanceId: null,
  instanceQuery: '',
  instanceStatusFilter: 'all',
  keypairStatus: { state: 'idle', message: '', response: null },
  creationStatus: { state: 'idle', message: '' },

  ensureFlavorData: async () => {
    const { flavorsStatus } = get();

    if (flavorsStatus === 'loading' || flavorsStatus === 'ready') return;

    set({ flavorsStatus: 'loading', flavorsError: '' });

    try {
      const data = await apiRequest<Flavor[]>('/api/v1/compute/flavors?available=true');
      set({ flavors: sortFlavors(data), flavorsStatus: 'ready', flavorsError: '' });
      ensureDefaultFlavor(get);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load flavors';
      set({ flavors: [], flavorsStatus: 'ready', flavorsError: translateError(message) });
    }
  },

  ensureInstanceData: async () => {
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
        instancesError: '',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load instances';
      set({ instancesError: translateError(message) });
    }
  },

  ensureInstanceById: async (id) => {
    try {
      const instance = await fetchComputeInstanceById(id);
      set((state) => {
        const next = [...state.instances];
        const index = next.findIndex((i) => i.id === instance.id);
        if (index >= 0) next[index] = { ...next[index], ...instance };
        else next.unshift(instance);
        return { instances: next, instancesError: '' };
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

  handleKeypairRegistration: async () => {
    const { draft, setKeypairStatus } = get();
    setKeypairStatus({ state: 'saving', message: '공개키를 등록하는 중입니다.', response: null });

    const status = await registerKeypair({
      name: draft.keypairName.trim(),
      public_key: draft.publicKey.trim(),
    });
    setKeypairStatus(status);
  },

  handleCreateInstance: async () => {
    const { draft, keypairStatus, upsertInstance, setCreationStatus } = get();
    const imageId = imageTemplates.find((item) => item.key === draft.imageTemplate)?.id ?? draft.imageId.trim();

    const payload = {
      name: draft.name.trim(),
      image_id: imageId,
      flavor_id: draft.selectedFlavorId,
      ...(keypairStatus.response?.name ? { key_name: keypairStatus.response.name } : {}),
    };

    setCreationStatus({ state: 'saving', message: '인스턴스 생성 요청을 보내는 중입니다.' });

    const keypairName = keypairStatus.response?.name ?? '';
    const { record, error } = await createInstance(payload, keypairName, draft.description.trim());

    if (record) {
      upsertInstance(record);
      setCreationStatus({ state: 'idle', message: '' });
      return '/compute';
    }

    setCreationStatus({ state: 'error', message: error ?? '생성 요청을 완료하지 못했습니다.' });
    return null;
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
