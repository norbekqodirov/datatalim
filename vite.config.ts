import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://localhost:4000',
          changeOrigin: true
        }
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD),
      // VITE_TELEGRAM_BOT_TOKEN va VITE_TELEGRAM_CHAT_ID deliberately removed
      // Telegram xabar yuborish backendda amalga oshadi (/api/notify-telegram)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const n = id.replace(/\\/g, '/');
            if (!n.includes('node_modules')) return;
            // Animation library (no React deps in core)
            if (
              n.includes('/framer-motion/') ||
              n.includes('/motion-dom/') ||
              n.includes('/motion-utils/') ||
              n.includes('/node_modules/motion/')
            ) {
              return 'vendor-motion';
            }
            // Charts (recharts + d3 + react-is which recharts needs)
            if (
              n.includes('/recharts/') ||
              n.includes('/d3-') ||
              n.includes('/d3/') ||
              n.includes('/victory') ||
              n.includes('/@reduxjs/') ||
              n.includes('/internmap/') ||
              n.includes('/robust-predicates/') ||
              n.includes('/delaunator/')
            ) {
              return 'vendor-charts';
            }
            // UI components
            if (
              n.includes('/lucide-react/') ||
              n.includes('/react-hot-toast/') ||
              n.includes('/qrcode') ||
              n.includes('/goober/')
            ) {
              return 'vendor-ui';
            }
            // All other node_modules (react, react-dom, router, zustand, etc) together
            return 'vendor';
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
