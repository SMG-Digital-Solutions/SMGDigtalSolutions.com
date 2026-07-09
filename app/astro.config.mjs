// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  vite: {
    plugins: [
      compression({ algorithm: 'gzip' }),
      compression({ algorithm: 'brotliCompress' }),
    ],
  },
});
