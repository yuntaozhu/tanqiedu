import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env': {}
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/replicate-proxy': {
          target: 'https://api.replicate.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/replicate-proxy/, ''),
        },
        '/ideogram-proxy': {
          target: 'https://api.ideogram.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ideogram-proxy/, ''),
        },
      }
    },
  };
});
