import type { StateCreator } from 'zustand';
import type { Draft } from '../../types';
import { imageTemplates, networkTemplates } from '../../constants';

export interface DraftSlice {
  draft: Draft;

  updateDraft: (updates: Partial<Draft>) => void;
  resetDraft: () => void;
  syncAssistFields: (changedName: string, value: string | null, checked: boolean) => void;
}

export const defaultDraft = (): Draft => ({
  name: '',
  description: '',
  selectedFlavorId: '',
  imageTemplate: imageTemplates[0]?.key ?? '',
  imageAssistEnabled: true,
  imageId: imageTemplates[0]?.id ?? '',
  networkTemplate: networkTemplates[0]?.key ?? '',
  networkAssistEnabled: true,
  networkId: networkTemplates[0]?.id ?? '',
  keypairName: '',
  publicKey: '',
});

export const createDraftSlice: StateCreator<DraftSlice, [], [], DraftSlice> = (set, get) => ({
  draft: defaultDraft(),

  updateDraft: (updates) => {
    set((state) => ({ draft: { ...state.draft, ...updates } }));
  },

  resetDraft: () => {
    set({ draft: defaultDraft() });
  },

  syncAssistFields: (changedName, value, checked) => {
    const { draft } = get();

    if (changedName === 'imageAssistEnabled') {
      const imageId = checked
        ? (imageTemplates.find((t) => t.key === draft.imageTemplate)?.id ??
          imageTemplates[0]?.id ??
          '')
        : draft.imageId;
      set((state) => ({ draft: { ...state.draft, imageAssistEnabled: checked, imageId } }));
      return;
    }

    if (changedName === 'networkAssistEnabled') {
      const networkId = checked
        ? (networkTemplates.find((t) => t.key === draft.networkTemplate)?.id ??
          networkTemplates[0]?.id ??
          '')
        : draft.networkId;
      set((state) => ({ draft: { ...state.draft, networkAssistEnabled: checked, networkId } }));
      return;
    }

    if (changedName === 'imageTemplate' && value !== null) {
      const imageId = draft.imageAssistEnabled
        ? (imageTemplates.find((t) => t.key === value)?.id ?? '')
        : draft.imageId;
      set((state) => ({ draft: { ...state.draft, imageTemplate: value, imageId } }));
      return;
    }

    if (changedName === 'networkTemplate' && value !== null) {
      const networkId = draft.networkAssistEnabled
        ? (networkTemplates.find((t) => t.key === value)?.id ?? '')
        : draft.networkId;
      set((state) => ({ draft: { ...state.draft, networkTemplate: value, networkId } }));
    }
  },
});
