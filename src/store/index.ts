import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice, type AuthSlice } from './slices/auth';
import { createDraftSlice, defaultDraft, type DraftSlice } from './slices/draft';
import { createComputeSlice, type ComputeSlice } from './slices/compute';
import { createStorageSlice, type StorageSlice } from './slices/storage';
import { createTerminalSlice, type TerminalSlice } from './slices/terminal';
import { STORAGE_KEYS, imageTemplates, networkTemplates } from '../constants';

type AppStore = AuthSlice & DraftSlice & ComputeSlice & StorageSlice & TerminalSlice;

export const useStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
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
        draft: state.draft,
        instances: state.instances,
        selectedInstanceId: state.selectedInstanceId,
        selectedContainerName: state.selectedContainerName,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppStore>;
        const draft = { ...defaultDraft(), ...(p.draft ?? {}) };
        const imageTemplate =
          imageTemplates.find((item) => item.key === draft.imageTemplate) ?? imageTemplates[0];
        const networkTemplate =
          networkTemplates.find((item) => item.key === draft.networkTemplate) ??
          networkTemplates[0];
        return {
          ...current,
          session: p.session ?? null,
          draft: {
            ...draft,
            imageTemplate: imageTemplate?.key ?? draft.imageTemplate,
            imageAssistEnabled: true,
            networkTemplate: networkTemplate?.key ?? draft.networkTemplate,
            networkAssistEnabled: true,
            imageId: imageTemplate?.id ?? draft.imageId,
            networkId: networkTemplate?.id ?? draft.networkId,
          },
          instances: p.instances ?? [],
          selectedInstanceId: p.selectedInstanceId ?? null,
          selectedContainerName: p.selectedContainerName ?? current.selectedContainerName,
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
  const instances = localStorage.getItem(STORAGE_KEYS.instances);
  const selectedInstanceId = localStorage.getItem(STORAGE_KEYS.selectedInstanceId);

  if (!session && !draft && !instances) return;

  try {
    const migrated = {
      state: {
        session: session ? (JSON.parse(session) as unknown) : null,
        draft: draft ? (JSON.parse(draft) as unknown) : {},
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
