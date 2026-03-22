import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface WhatsAppButtonProps {
  phone?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = '998901234567',
}) => {
  const location = useLocation();

  if (location.pathname.startsWith('/paneladmindata')) {
    return null;
  }

  const message = encodeURIComponent("Salom! DATA Ta'lim haqida ma'lumot olmoqchiman.");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-30" />
        <span className="absolute inset-0 rounded-full animate-pulse bg-green-400 opacity-20 scale-110" />

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp orqali bog'lanish"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 transition-colors shadow-[0_8px_32px_rgba(34,197,94,0.4)] backdrop-blur-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-7 h-7 fill-white"
          >
            <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.312 22.594c-.39 1.1-1.932 2.014-3.178 2.28-.852.182-1.964.326-5.71-1.228-4.8-1.988-7.886-6.862-8.126-7.18-.23-.318-1.932-2.572-1.932-4.904s1.222-3.476 1.656-3.952c.434-.476.948-.596 1.264-.596.316 0 .632.004.908.016.292.014.684-.11 1.07.816.39.944 1.326 3.236 1.442 3.47.116.234.194.506.04.816-.156.316-.234.51-.468.786-.234.274-.49.612-.702.822-.234.234-.478.488-.206.96.274.468 1.216 2.006 2.612 3.25 1.794 1.598 3.306 2.094 3.774 2.328.468.234.742.194 1.014-.118.274-.316 1.174-1.37 1.486-1.842.316-.468.628-.39 1.062-.234.434.156 2.754 1.3 3.226 1.536.468.234.782.354.898.55.116.194.116 1.136-.274 2.234z" />
          </svg>
        </a>
      </motion.div>
    </AnimatePresence>
  );
};
