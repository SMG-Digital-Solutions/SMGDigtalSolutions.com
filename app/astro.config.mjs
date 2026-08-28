// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import critters from '@critters-rs/astro';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  // Powers Astro.site, used for the canonical <link> in Layout.astro — a
  // static build has no request context to infer the real origin from
  // otherwise.
  site: 'https://smgdigitalsolutions.com',
  integrations: [react(), tailwind({ applyBaseStyles: false }), critters()],
  vite: {
    plugins: [
      compression({ algorithm: 'gzip' }),
      compression({ algorithm: 'brotliCompress' }),
    ],
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'framer-motion': ['framer-motion'],
            'react-vendor': ['react', 'react-dom'],
          },
        },
      },
    },
    ssr: {
      noExternal: ['framer-motion'],
    },
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  output: 'static',
});
