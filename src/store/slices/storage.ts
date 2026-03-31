import type { StateCreator } from 'zustand';
import { storageBuckets } from '../../constants';

export interface StorageSlice {
  selectedBucketId: string | null;
  setSelectedBucketId: (id: string) => void;
}

export const createStorageSlice: StateCreator<StorageSlice, [], [], StorageSlice> = (set) => ({
  selectedBucketId: storageBuckets[0]?.id ?? null,
  setSelectedBucketId: (id) => set({ selectedBucketId: id }),
});
