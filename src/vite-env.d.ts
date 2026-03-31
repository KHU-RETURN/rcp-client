/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RCP_API_BASE_URL: string;
  readonly VITE_RCP_DEMO_MODE: 'auto' | 'force';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
