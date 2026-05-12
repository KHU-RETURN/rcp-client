import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './'); 

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_RCP_API_BASE_URL || 'https://return-api.khu-return.com',
          changeOrigin: true,
        },
      },
    },
  };
});