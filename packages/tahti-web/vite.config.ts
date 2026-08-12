import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tahtiApi =
    env.VITE_TAHTI_API_PROXY_TARGET ||
    env.VITE_TAHTI_API_URL ||
    'http://localhost:15011';

  return {
    plugins: [react(), tailwindcss(), svgr()],
    clearScreen: false,
    server: {
      host: process.env.VITE_HOST ?? 'localhost',
      port: 5180,
      strictPort: true,
      proxy: {
        '/tahti-api': {
          target: tahtiApi,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tahti-api/, ''),
        },
      },
    },
    preview: {
      port: 5180,
    },
  };
});
