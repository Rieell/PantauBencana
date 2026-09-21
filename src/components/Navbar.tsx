import React, { useState, useEffect } from 'react';
import { PageId, UserAccount } from '../types';
import { Clock, Menu, X, LogIn, User } from 'lucide-react';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  currentUser: UserAccount | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [timeStr, setTimeStr] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatted = now.toLocaleTimeString('id-ID', options).replace(/\./g, ':');
      setTimeStr(`${formatted} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks: { id: PageId; label: string }[] = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'peta-bencana', label: 'Peta Bencana' },
    { id: 'data-kejadian', label: 'Data Kejadian' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-surface-container">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-2 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold shadow-sm">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-[18px] font-bold tracking-tight text-primary leading-none">
                Pantau<span className="text-secondary">Bencana</span>
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium tracking-wide">Data Spasial Kebencanaan</span>
            </div>
          </button>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id || (link.id === 'beranda' && currentPage === 'dashboard');
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-title-md text-[14px] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-high text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live WIB Clock */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface-variant font-medium border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-on-surface font-semibold">{timeStr || 'WIB'}</span>
          </div>

          {/* Login Action (Panel Admin replaced with Login, Keluar button removed) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-white font-label-lg text-sm rounded-lg hover:bg-primary transition-all shadow-xs active:scale-95 cursor-pointer font-semibold"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-2 border border-surface-container hover:border-primary text-on-surface hover:text-primary font-label-lg text-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer font-medium"
            >
              <User className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-container bg-white px-4 py-3 space-y-2 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-title-md text-[14px] ${
                  currentPage === link.id || (link.id === 'beranda' && currentPage === 'dashboard')
                    ? 'bg-surface-container-high text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-surface-container grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-primary-container text-white text-center rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button
              onClick={() => {
                onNavigate('register');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 border border-surface-container text-on-surface text-center rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
