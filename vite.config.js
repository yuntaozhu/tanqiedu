import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Hardcoded keys to bypass .env file corruption issues
  const API_KEY = 'AIzaSyB-9VLihuSqGBlXhtplM-0tYoTJtcxPkuw';
  const IDEOGRAM_API_KEY = 'gB9nFQE-sKZdmUP2Mz57BWT3LZhrshRJVfhSjwNZyK6tLeDhelno_r5voadFeIYBD1KyFl9pSoU-NTBppqvO8w';
  const REPLICATE_API_TOKEN = 'f56ec386ae935002f1a9643893ebd6bc44a4d75b';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(API_KEY),
      'process.env.IDEOGRAM_API_KEY': JSON.stringify(IDEOGRAM_API_KEY),
      'process.env.REPLICATE_API_TOKEN': JSON.stringify(REPLICATE_API_TOKEN),
    },
  };
});
