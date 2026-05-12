import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    proxy: {
      // 핵심: 브라우저는 4173에 요청을 보내는 줄 알지만, Vite 서버가 중간에서 낚아챕니다.
      "/api": {
        target: "https://return-api.khu-return.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});