import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

// Saytning har sahifasida tepada doim turadigan "test rejimi" tasmasi (admin'da yo'q).
// Joy index.html'dagi skript qo'ygan `has-tbar` klassi bilan ajratiladi; bu yerda faqat SPA ichida admin ⇄ sayt o'tishi kuzatiladi.
export const TestModeBar: React.FC = () => {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.classList.toggle('has-tbar', !admin);
  }, [admin]);

  if (admin) return null;
  return (
    <div className="test-bar" role="status">
      <AlertTriangle size={13} aria-hidden="true" />
      Sayt test rejimida ishlamoqda
    </div>
  );
};
