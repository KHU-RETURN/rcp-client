import type { StateCreator } from 'zustand';

export interface StorageSlice {
  selectedBucketId: string | null;
  setSelectedBucketId: (id: string) => void;
}

export const createStorageSlice: StateCreator<StorageSlice, [], [], StorageSlice> = (set) => ({
  selectedBucketId: null,
  setSelectedBucketId: (id) => set({ selectedBucketId: id }),
});
