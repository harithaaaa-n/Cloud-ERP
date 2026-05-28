import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],

    server: {
      port: 3000,
      // Dev proxy: forwards all /api requests to local Express server
      // No proxy needed in production — VITE_API_URL points to deployed backend
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:5000',
          ws: true,           // Proxy WebSocket connections in dev
          changeOrigin: true,
        },
      },
    },

    build: {
      // Disable source maps in production to avoid exposing source code
      sourcemap: isProd ? false : 'inline',

      // Increase chunk warning threshold (Recharts + framer-motion are large)
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Split vendor libraries into separate chunks for better caching
          manualChunks: {
            'react-core':   ['react', 'react-dom', 'react-router-dom'],
            'charts':       ['recharts'],
            'animations':   ['framer-motion'],
            'socket':       ['socket.io-client'],
            'icons':        ['lucide-react'],
            'http-client':  ['axios'],
          },
        },
      },

      // Target modern browsers — avoids polyfill bloat
      target: 'es2020',
    },
  };
});
