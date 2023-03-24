import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import react from '@vitejs/plugin-react';
import dns from 'dns';
import typescript from '@rollup/plugin-typescript';
import ttypescript from 'ttypescript';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true, port: 8080 },
  plugins: [
    react(),
    mkcert(),
    typescript({
      typescript: ttypescript,
    }),
  ],
});
