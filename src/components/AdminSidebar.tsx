import React from 'react';
import { PageId, UserAccount } from '../types';
import { ArrowLeft, X } from 'lucide-react';

interface AdminSidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  currentUser?: UserAccount | null;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  isOpen = true,
  onClose,
  onLogout: _onLogout,
  currentUser
}) => {
  const menuItems: { id: PageId; label: string; icon: string }[] = [
    { id: 'dashboard-admin', label: 'Ringkasan Eksekutif', icon: 'dashboard' },
    { id: 'kelola-data-admin', label: 'Kelola Data Kejadian', icon: 'dataset' },
    { id: 'kelola-pengguna-admin', label: 'Kelola Pengguna', icon: 'group' },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile & when toggled */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-45 lg:hidden transition-opacity duration-500"
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-full w-64 lg:w-72 bg-white z-50 flex flex-col shadow-[0_1px_16px_rgba(0,0,0,0.08)] border-r border-surface-container transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Badge + Close Button */}
        <div className="h-16 px-space-lg flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              <span className="material-symbols-outlined text-[18px]">public</span>
            </div>
            <span className="font-headline-md text-[17px] font-bold text-primary tracking-tight">
              Pantau<span className="text-secondary">Bencana</span>
            </span>
            <span className="rounded bg-primary-fixed px-1.5 py-0.5 font-label-sm text-[10px] text-primary font-bold uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          {/* Close button for mobile or direct toggle */}
          <button
            onClick={onClose}
            aria-label="Tutup Menu"
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-space-md py-space-sm space-y-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-outline uppercase tracking-wider px-3 py-1.5 flex items-center justify-between">
            <span>Menu Manajemen</span>
            <span className="text-[10px] bg-surface-container text-primary font-bold px-1.5 py-0.5 rounded">3 Modul</span>
          </div>

          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  // on small screens, auto-close sidebar on item select
                  if (window.innerWidth < 1024 && onClose) {
                    onClose();
                  }
                }}
                className={`w-full flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-all text-left font-label-lg text-label-lg cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-white font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-headline-md">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-surface-container">
            <div className="text-[11px] font-semibold text-outline uppercase tracking-wider px-3 py-1.5">
              Navigasi Publik
            </div>
            <button
              onClick={() => {
                onNavigate('beranda');
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-[13px] text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-body-md">home</span>
              <span>Dashboard Publik</span>
            </button>
            <button
              onClick={() => {
                onNavigate('peta-bencana');
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-[13px] text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-body-md">map</span>
              <span>Peta Bencana</span>
            </button>
            <button
              onClick={() => {
                onNavigate('data-kejadian');
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low text-[13px] text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-body-md">table_rows</span>
              <span>Katalog Data Kejadian</span>
            </button>
          </div>
        </nav>

        {/* Session Card & Return button */}
        <div className="p-space-md bg-surface-container-low mx-space-md mb-space-md rounded-xl border border-surface-container space-y-space-xs">
          <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
            Sesi Administrator
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="font-body-sm text-body-sm text-on-surface font-semibold">{currentUser?.nama || 'Administrator'}</p>
          </div>
          <p className="text-[11px] text-on-surface-variant truncate">{currentUser?.email}</p>
          <button
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-space-xs text-secondary font-label-md text-label-md hover:underline pt-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Publik</span>
          </button>
        </div>
      </aside>
    </>
  );
};
