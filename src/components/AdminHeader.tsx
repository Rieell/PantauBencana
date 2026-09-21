import React from 'react';
import { PageId, UserAccount } from '../types';
import { LogOut, ExternalLink, Menu } from 'lucide-react';

interface AdminHeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onLogout?: () => void;
  currentUser?: UserAccount | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  currentPage, 
  onNavigate, 
  onToggleSidebar, 
  isSidebarOpen = true,
  onLogout,
  currentUser
}) => {
  const inisial = (currentUser?.nama || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container transition-all duration-500 ease-in-out ${
        isSidebarOpen ? 'lg:left-72 left-0' : 'left-0'
      }`}
    >
      {/* Left: 3-line Hamburger Menu Button + Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka Menu Manajemen"
          title="Menu Manajemen (Buka/Tutup Sidebar)"
          className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors border border-surface-container cursor-pointer active:scale-95 shadow-2xs"
        >
          <Menu className="w-5 h-5 text-primary" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium hidden sm:inline">Otoritas PantauBencana /</span>
          <span className="font-title-md text-[15px] font-bold text-on-surface">
            {currentPage === 'dashboard-admin' && 'Ringkasan Eksekutif & Statistik'}
            {currentPage === 'kelola-data-admin' && 'Kelola Data Kejadian Bencana'}
            {currentPage === 'kelola-pengguna-admin' && 'Kelola Pengguna & Hak Akses'}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Public view shortcut */}
        <button
          onClick={() => onNavigate('beranda')}
          title="Buka Website Publik"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary text-xs font-semibold cursor-pointer border border-surface-container transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Lihat Publik</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-surface-container">
          <div className="text-right hidden sm:block">
            <p className="font-label-lg text-[13px] text-on-surface font-semibold leading-tight">
              {currentUser?.nama || 'Administrator'}
            </p>
            <p className="text-[11px] text-on-surface-variant">Administrator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-primary/20">
            {inisial}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
