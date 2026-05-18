export interface Flavor {
  id: string;
  name: string;
  vcpus: number;
  ram: number;
  disk: number;
  max_configurable: number;
}

export interface Instance {
  id: string;
  name: string;
  status: string;
  created: string;
  updated: string;
  flavorId: string;
  flavorName: string | undefined;
  imageId: string;
  networkId: string;
  keyName: string;
  note: string;
}

export interface Draft {
  name: string;
  description: string;
  selectedFlavorId: string;
  imageTemplate: string;
  imageAssistEnabled: boolean;
  imageId: string;
  networkTemplate: string;
  networkAssistEnabled: boolean;
  networkId: string;
  keypairName: string;
  publicKey: string;
}

export interface KeypairResponse {
  name: string;
  fingerprint: string;
  public_key: string;
}

export type KeypairState = 'idle' | 'saving' | 'saved' | 'error';

export interface KeypairStatus {
  state: KeypairState;
  message: string;
  response: KeypairResponse | null;
}

export type CreationState = 'idle' | 'saving' | 'error';

export interface CreationStatus {
  state: CreationState;
  message: string;
}

export interface SectionState {
  title: string;
  valid: boolean;
  error: boolean;
}

export type SectionKey = 'basic' | 'compute' | 'image-network' | 'access' | 'review';
export type SectionStates = Record<SectionKey, SectionState>;

export type InstanceStatusFilter = 'all' | 'active' | 'build';

export type StatusTone = 'valid' | 'pending' | 'error';
