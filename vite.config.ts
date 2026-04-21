import { defineConfig, loadEnv } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function getAllowedHosts(env: Record<string, string>): string[] {
  const hosts: string[] = [];
  const appUrl = env.VITE_APP_URL;
  if (appUrl) {
    try {
      const hostname = new URL(appUrl).hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        hosts.push(hostname);
      }
    } catch {}
  }
  return hosts;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      devtools(),
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
    server: {
      allowedHosts: getAllowedHosts(env),
    },
  };
});
