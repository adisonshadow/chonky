import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { chonkyVitePlugin } from '@chonkylang/vite-plugin';

const projectRoot = path.resolve(__dirname);

export default defineConfig({
  plugins: [
    chonkyVitePlugin({ projectRoot }),
    react(),
  ],
  root: projectRoot,
});
