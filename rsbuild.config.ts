import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL || 'http://localhost:8001'),
    },
  },
  html: {
    template: './index.html',
  },
  server: {
    port: 3000,
  },
});
