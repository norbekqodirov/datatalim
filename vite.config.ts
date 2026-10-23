import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
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
    // Eslatma: bu yerda sir (API kalit, parol) `define` orqali bundle'ga INJECT QILINMAYDI.
    // Telegram xabar yuborish backendda amalga oshadi (/api/notify-telegram).
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const n = id.replace(/\\/g, '/');
            if (!n.includes('/node_modules/')) return;
            // React yadrosi (har sahifada kerak)
            if (
              n.includes('/node_modules/react/') ||
              n.includes('/node_modules/react-dom/') ||
              n.includes('/node_modules/react-router/') ||
              n.includes('/node_modules/react-router-dom/') ||
              n.includes('/node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            // Animation library (no React deps in core)
            if (
              n.includes('/framer-motion/') ||
              n.includes('/motion-dom/') ||
              n.includes('/motion-utils/') ||
              n.includes('/node_modules/motion/')
            ) {
              return 'vendor-motion';
            }
            // Charts (recharts + d3 + ularning yordamchi paketlari)
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
              n.includes('/goober/')
            ) {
              return 'vendor-ui';
            }
            // Qolgan hamma paket (jspdf, html2canvas, canvg, dompurify, qrcode, zustand ...) ataylab
            // chunk'ga biriktirilmaydi: Rollup ularni o'zini import qilgan (lazy) chunk'ga qo'shadi, shunda
            // PDF kutubxonalari bosh sahifaning modulepreload ro'yxatiga tushmaydi.
            return undefined;
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
