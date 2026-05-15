import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice, type AuthSlice } from './slices/auth';
import { createConnectionSlice, type ConnectionSlice } from './slices/connection';
import { createDraftSlice, defaultDraft, type DraftSlice } from './slices/draft';
import { createComputeSlice, type ComputeSlice } from './slices/compute';
import { createStorageSlice, type StorageSlice } from './slices/storage';
import { createTerminalSlice, type TerminalSlice } from './slices/terminal';
import { STORAGE_KEYS, imageTemplates, networkTemplates } from '../constants';
import { buildSeedInstances } from '../constants/mock-data';

type AppStore = AuthSlice & ConnectionSlice & DraftSlice & ComputeSlice & StorageSlice & TerminalSlice;

export const useStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createConnectionSlice(...args),
      ...createDraftSlice(...args),
      ...createComputeSlice(...args),
      ...createStorageSlice(...args),
      ...createTerminalSlice(...args),
    }),
    {
      name: 'rcp-front-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Partial<AppStore> => ({
        session: state.session,
        customMockUsers: state.customMockUsers,
        draft: state.draft,
        result: state.result,
        instances: state.instances,
        selectedInstanceId: state.selectedInstanceId,
        selectedBucketId: state.selectedBucketId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppStore>;
        const draft = { ...defaultDraft(), ...(p.draft ?? {}) };
        const imageTemplate = imageTemplates.find((item) => item.key === draft.imageTemplate) ?? imageTemplates[0];
        const networkTemplate = networkTemplates.find((item) => item.key === draft.networkTemplate) ?? networkTemplates[0];
        return {
          ...current,
          session: p.session ?? null,
          customMockUsers: p.customMockUsers ?? [],
          draft: {
            ...draft,
            imageTemplate: imageTemplate?.key ?? draft.imageTemplate,
            imageAssistEnabled: true,
            networkTemplate: networkTemplate?.key ?? draft.networkTemplate,
            networkAssistEnabled: true,
            imageId: imageTemplate?.id ?? draft.imageId,
            networkId: networkTemplate?.id ?? draft.networkId,
          },
          result: p.result ?? null,
          instances: (p.instances && p.instances.length > 0) ? p.instances : buildSeedInstances(),
          selectedInstanceId: p.selectedInstanceId ?? null,
          selectedBucketId: p.selectedBucketId ?? current.selectedBucketId,
        };
      },
    },
  ),
);

// Named storage key migration compatibility
// The old app used individual localStorage keys; new store uses a single key.
// On first load, attempt to migrate old keys.
function migrateFromLegacyStorage(): void {
  const newKey = 'rcp-front-store';
  if (localStorage.getItem(newKey)) return; // already migrated

  const session = localStorage.getItem(STORAGE_KEYS.session);
  const draft = localStorage.getItem(STORAGE_KEYS.draft);
  const result = localStorage.getItem(STORAGE_KEYS.result);
  const instances = localStorage.getItem(STORAGE_KEYS.instances);
  const selectedInstanceId = localStorage.getItem(STORAGE_KEYS.selectedInstanceId);
  const authUsers = localStorage.getItem(STORAGE_KEYS.authUsers);

  if (!session && !draft && !instances) return;

  try {
    const migrated = {
      state: {
        session: session ? (JSON.parse(session) as unknown) : null,
        customMockUsers: authUsers ? (JSON.parse(authUsers) as unknown) : [],
        draft: draft ? (JSON.parse(draft) as unknown) : {},
        result: result ? (JSON.parse(result) as unknown) : null,
        instances: instances ? (JSON.parse(instances) as unknown) : [],
        selectedInstanceId: selectedInstanceId ? (JSON.parse(selectedInstanceId) as unknown) : null,
      },
      version: 0,
    };
    localStorage.setItem(newKey, JSON.stringify(migrated));
  } catch {
    // ignore migration errors
  }
}

migrateFromLegacyStorage();
