import type { StateCreator } from 'zustand';
import { ApiRequestError } from '../../types';
import type {
  StorageContainer,
  StorageObject,
  StorageContainersStatus,
  StorageObjectsStatus,
  StorageActionStatus,
} from '../../types';
import { translateError } from '../../utils';
import {
  fetchContainers,
  createContainer,
  deleteContainer,
  fetchObjects,
  uploadObject,
  downloadObject,
  downloadObjectArchive,
  deleteObject,
} from '../../services/storage';
import {
  buildArchiveFilename,
  getUploadObjectKey,
  normalizeObjectPrefix,
} from '../../services/storage-paths';
import { prepareResponseFileDownload } from '../../services/downloads';

type DeleteContainerResult =
  | { state: 'ok' }
  | { state: 'not-empty' }
  | { state: 'error'; message: string };

export interface StorageSlice {
  containers: StorageContainer[];
  containersStatus: StorageContainersStatus;
  containersError: string;
  selectedContainerName: string | null;
  objectsByContainer: Record<string, StorageObject[]>;
  objectsStatus: Record<string, StorageObjectsStatus>;
  objectsError: string;
  containerCreation: StorageActionStatus;
  objectUpload: StorageActionStatus;

  setSelectedContainerName: (name: string | null) => void;
  ensureContainers: (force?: boolean) => Promise<void>;
  createNewContainer: (name: string) => Promise<{ ok: boolean; error?: string }>;
  removeContainer: (name: string, force?: boolean) => Promise<DeleteContainerResult>;
  ensureObjects: (name: string, force?: boolean) => Promise<void>;
  uploadFile: (name: string, file: File) => Promise<{ ok: boolean; error?: string }>;
  uploadFiles: (name: string, files: File[]) => Promise<{ ok: boolean; error?: string }>;
  downloadFile: (name: string, key: string) => Promise<{ ok: boolean; error?: string }>;
  downloadFolder: (name: string, prefix: string) => Promise<{ ok: boolean; error?: string }>;
  removeObject: (name: string, key: string) => Promise<{ ok: boolean; error?: string }>;
  resetStorageUiState: () => void;
}

export const createStorageSlice: StateCreator<StorageSlice, [], [], StorageSlice> = (set, get) => ({
  containers: [],
  containersStatus: 'idle',
  containersError: '',
  selectedContainerName: null,
  objectsByContainer: {},
  objectsStatus: {},
  objectsError: '',
  containerCreation: { state: 'idle', message: '' },
  objectUpload: { state: 'idle', message: '' },

  setSelectedContainerName: (name) => set({ selectedContainerName: name }),

  ensureContainers: async (force = false) => {
    const { containersStatus } = get();
    if (!force && (containersStatus === 'loading' || containersStatus === 'ready')) return;

    set({ containersStatus: 'loading', containersError: '' });

    try {
      const data = await fetchContainers();
      set((state) => {
        const selectedExists =
          state.selectedContainerName && data.some((c) => c.name === state.selectedContainerName);
        return {
          containers: data,
          containersStatus: 'ready',
          containersError: '',
          selectedContainerName: selectedExists
            ? state.selectedContainerName
            : (data[0]?.name ?? null),
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load containers';
      set({
        containers: [],
        containersStatus: 'ready',
        containersError: translateError(message),
      });
    }
  },

  createNewContainer: async (rawName) => {
    const name = rawName.trim();
    if (!name) {
      return { ok: false, error: '컨테이너 이름을 입력해 주세요.' };
    }

    set({ containerCreation: { state: 'saving', message: '컨테이너를 만드는 중입니다.' } });

    try {
      const container = await createContainer({ name });
      set((state) => ({
        containers: [container, ...state.containers.filter((c) => c.name !== container.name)],
        containerCreation: { state: 'idle', message: '' },
        selectedContainerName: container.name,
      }));
      return { ok: true };
    } catch (error) {
      const status = error instanceof ApiRequestError ? error.status : undefined;
      const raw = error instanceof Error ? error.message : 'Unknown error';
      const message =
        status === 409 ? '같은 이름의 컨테이너가 이미 있습니다.' : translateError(raw);
      set({ containerCreation: { state: 'error', message } });
      return { ok: false, error: message };
    }
  },

  removeContainer: async (name, force = false) => {
    try {
      await deleteContainer(name, force);
      set((state) => {
        const containers = state.containers.filter((c) => c.name !== name);
        const objectsByContainer = { ...state.objectsByContainer };
        delete objectsByContainer[name];
        const objectsStatus = { ...state.objectsStatus };
        delete objectsStatus[name];
        return {
          containers,
          objectsByContainer,
          objectsStatus,
          selectedContainerName:
            state.selectedContainerName === name
              ? (containers[0]?.name ?? null)
              : state.selectedContainerName,
        };
      });
      return { state: 'ok' };
    } catch (error) {
      const status = error instanceof ApiRequestError ? error.status : undefined;
      if (status === 409) return { state: 'not-empty' };
      const message =
        status === 404
          ? '컨테이너를 찾을 수 없습니다.'
          : translateError(error instanceof Error ? error.message : 'Unknown error');
      return { state: 'error', message };
    }
  },

  ensureObjects: async (name, force = false) => {
    const { objectsStatus } = get();
    const status = objectsStatus[name];
    if (!force && (status === 'loading' || status === 'ready')) return;

    set((state) => ({
      objectsStatus: { ...state.objectsStatus, [name]: 'loading' },
      objectsError: '',
    }));

    try {
      const data = await fetchObjects(name);
      set((state) => ({
        objectsByContainer: { ...state.objectsByContainer, [name]: data },
        objectsStatus: { ...state.objectsStatus, [name]: 'ready' },
        objectsError: '',
      }));
    } catch (error) {
      const status = error instanceof ApiRequestError ? error.status : undefined;
      const message =
        status === 404
          ? '컨테이너를 찾을 수 없습니다.'
          : translateError(error instanceof Error ? error.message : 'Unknown error');
      set((state) => ({
        objectsByContainer: { ...state.objectsByContainer, [name]: [] },
        objectsStatus: { ...state.objectsStatus, [name]: 'ready' },
        objectsError: message,
      }));
    }
  },

  uploadFile: async (name, file) => {
    return get().uploadFiles(name, [file]);
  },

  uploadFiles: async (name, files) => {
    if (files.length === 0) {
      return { ok: false, error: '업로드할 파일을 선택해 주세요.' };
    }

    const uploadLabel =
      files.length === 1 ? `${files[0].name} 업로드 중...` : `${files.length}개 파일 업로드 중...`;
    set({ objectUpload: { state: 'saving', message: uploadLabel } });

    try {
      for (const file of files) {
        await uploadObject(name, file, getUploadObjectKey(file));
      }
      await get().ensureObjects(name, true);
      set({ objectUpload: { state: 'idle', message: '' } });
      return { ok: true };
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Unknown error';
      const message = translateError(raw);
      set({ objectUpload: { state: 'error', message } });
      return { ok: false, error: message };
    }
  },

  downloadFile: async (name, key) => {
    try {
      const filename = key.split('/').pop() || key;
      const download = prepareResponseFileDownload(filename);
      await download.ready;
      const response = await downloadObject(name, key);
      await download.save(response);
      return { ok: true };
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Unknown error';
      return { ok: false, error: translateError(raw) };
    }
  },

  downloadFolder: async (name, prefix) => {
    try {
      const normalizedPrefix = normalizeObjectPrefix(prefix);
      const filename = buildArchiveFilename(normalizedPrefix, name);
      const download = prepareResponseFileDownload(filename);
      await download.ready;
      const response = await downloadObjectArchive(name, normalizedPrefix);
      await download.save(response);
      return { ok: true };
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Unknown error';
      return { ok: false, error: translateError(raw) };
    }
  },

  removeObject: async (name, key) => {
    try {
      await deleteObject(name, key);
      set((state) => {
        const current = state.objectsByContainer[name] ?? [];
        return {
          objectsByContainer: {
            ...state.objectsByContainer,
            [name]: current.filter((o) => o.name !== key),
          },
        };
      });
      return { ok: true };
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Unknown error';
      return { ok: false, error: translateError(raw) };
    }
  },

  resetStorageUiState: () => {
    set({
      containerCreation: { state: 'idle', message: '' },
      objectUpload: { state: 'idle', message: '' },
      objectsError: '',
    });
  },
});
