import React, { useState, useEffect } from 'react';
import { PageId, DisasterRecord, UserAccount } from './types';
import { INITIAL_DISASTERS } from './data/mockData';
import { api, AUTH_EXPIRED_EVENT, clearToken, DisasterPayload, getToken, Paginated, simpanDisaster } from './lib/api';

// Public Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Admin Components
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';

// 8 Pages
import { DashboardPage } from './pages/DashboardPage';
import { PetaBencanaPage } from './pages/PetaBencanaPage';
import { DataKejadianPage } from './pages/DataKejadianPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminKelolaDataPage } from './pages/AdminKelolaDataPage';
import { AdminKelolaPenggunaPage } from './pages/AdminKelolaPenggunaPage';

import { Layers, ChevronDown, ChevronUp, Shield, ExternalLink } from 'lucide-react';

export default function App() {
  // Navigation state defaults to 'dashboard' (halaman awal buka website sesuai spesifikasi)
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(true);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);

  // Data kejadian terbaru (untuk Dashboard). Tabel & peta mengambil datanya sendiri dari database.
  const [disasters, setDisasters] = useState<DisasterRecord[]>(INITIAL_DISASTERS);

  const refreshDisasters = () => {
    api<Paginated<DisasterRecord>>('/api/disasters?page=1&pageSize=20')
      .then((res) => {
        if (res.data.length > 0) setDisasters(res.data);
      })
      .catch((err) => console.warn('Gagal memuat data dari database, pakai data contoh:', err));
  };

  useEffect(() => {
    refreshDisasters();
  }, []);

  // Sesi login: pengguna diambil dari database lewat token yang tersimpan di browser
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setAuthChecked(true);
      return;
    }
    api<{ user: UserAccount }>('/api/auth/me')
      .then((res) => setCurrentUser(res.user))
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // Token kedaluwarsa / akun dihapus -> otomatis keluar
  useEffect(() => {
    const onExpired = () => {
      setCurrentUser(null);
      setCurrentPage('login');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Tambah kejadian dari Dashboard Admin: disimpan ke database
  const handleAddDisaster = async (newRecord: DisasterRecord) => {
    const payload: DisasterPayload = {
      jenis: newRecord.jenis,
      tanggalIso: newRecord.tanggalIso,
      kabupatenKota: newRecord.kabupatenKota,
      provinsi: newRecord.provinsi,
      penyebab: newRecord.penyebab,
      korbanMeninggal: newRecord.korbanMeninggal ?? 0,
      korbanHilang: newRecord.korbanHilang ?? 0,
      korbanLuka: newRecord.korbanLuka ?? 0,
      rumahRusak: newRecord.rumahRusak ?? 0,
      rumahTerendam: newRecord.rumahTerendam ?? 0,
      fasilitasRusak: newRecord.fasilitasRusak ?? 0,
    };
    await simpanDisaster(payload);
    refreshDisasters();
  };

  // Page classification
  const isAdminRoute =
    currentPage === 'dashboard-admin' ||
    currentPage === 'kelola-data-admin' ||
    currentPage === 'kelola-pengguna-admin';

  // Halaman admin hanya untuk akun berperan Admin; selain itu diarahkan ke halaman login
  const adminAllowed = currentUser?.peran === 'Admin';
  const isAdminPage = isAdminRoute && adminAllowed;

  useEffect(() => {
    if (authChecked && isAdminRoute && !adminAllowed) setCurrentPage('login');
  }, [authChecked, isAdminRoute, adminAllowed]);

  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  // 8 Total Pages for Quick Navigation
  const allPages: { id: PageId; label: string; group: 'Publik' | 'Admin' | 'Otentikasi' }[] = [
    { id: 'dashboard', label: '1. Dashboard (Awal)', group: 'Publik' },
    { id: 'peta-bencana', label: '2. Peta Bencana', group: 'Publik' },
    { id: 'data-kejadian', label: '3. Data Kejadian', group: 'Publik' },
    { id: 'register', label: '4. Register', group: 'Otentikasi' },
    { id: 'login', label: '5. Login', group: 'Otentikasi' },
    { id: 'dashboard-admin', label: '6. Dashboard Admin', group: 'Admin' },
    { id: 'kelola-data-admin', label: '7. Kelola Data Admin', group: 'Admin' },
    { id: 'kelola-pengguna-admin', label: '8. Kelola Pengguna Admin', group: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Quick 8-Page Switcher Pill (Floating tool to effortlessly preview all 8 requested pages) */}
      <div className="fixed bottom-4 left-4 z-50 print:hidden">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-surface-container overflow-hidden transition-all duration-200">
          <button
            onClick={() => setQuickSwitcherOpen(!quickSwitcherOpen)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low transition-colors cursor-pointer w-full"
            title="Buka Navigasi Cepat 8 Halaman"
          >
            <Layers className="w-4 h-4 text-secondary" />
            <span>Navigasi 8 Halaman:</span>
            <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold text-on-surface">
              {allPages.find((p) => p.id === currentPage)?.label.replace(/^\d+\.\s*/, '')}
            </span>
            {quickSwitcherOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {quickSwitcherOpen && (
            <div className="p-3 border-t border-surface-container max-h-72 overflow-y-auto w-64 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-outline px-1">
                Pilih Dari 8 Halaman Website:
              </div>
              <div className="space-y-1">
                {allPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setCurrentPage(page.id);
                      setQuickSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      currentPage === page.id
                        ? 'bg-primary text-white font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{page.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        currentPage === page.id
                          ? 'bg-white/20 text-white'
                          : page.group === 'Admin'
                          ? 'bg-secondary-fixed text-secondary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {page.group}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDER ADMIN LAYOUT */}
      {isAdminPage ? (
        <div className="flex min-h-screen bg-[#f7f9ff] relative overflow-x-hidden">
          {/* Admin Sidebar */}
          <AdminSidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isOpen={adminSidebarOpen}
            onClose={() => setAdminSidebarOpen(false)}
            onLogout={handleLogout}
            currentUser={currentUser}
          />

          {/* Admin Main Content Area */}
          <div 
            className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${
              adminSidebarOpen ? 'lg:pl-72 pl-0' : 'pl-0'
            }`}
          >
            <AdminHeader
              currentPage={currentPage}
              onNavigate={setCurrentPage}
              onToggleSidebar={() => setAdminSidebarOpen(!adminSidebarOpen)}
              isSidebarOpen={adminSidebarOpen}
              onLogout={handleLogout}
              currentUser={currentUser}
            />

            <main className="flex-1 pt-24 sm:pt-28 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
              {currentPage === 'dashboard-admin' && (
                <AdminDashboardPage
                  onNavigate={setCurrentPage}
                  disasters={disasters}
                  onAddDisaster={handleAddDisaster}
                  currentUser={currentUser}
                />
              )}

              {currentPage === 'kelola-data-admin' && (
                <AdminKelolaDataPage onNavigate={setCurrentPage} onDataChanged={refreshDisasters} />
              )}

              {currentPage === 'kelola-pengguna-admin' && (
                <AdminKelolaPenggunaPage onNavigate={setCurrentPage} />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* RENDER PUBLIC & AUTH LAYOUT */
        <div className="flex flex-col min-h-screen">
          {/* Navbar visible on public and auth pages */}
          <Navbar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main className="flex-1 pt-20 sm:pt-24 pb-10">
            {(currentPage === 'dashboard' || currentPage === 'beranda') && (
              <DashboardPage onNavigate={setCurrentPage} disasters={disasters} />
            )}

            {currentPage === 'peta-bencana' && (
              <PetaBencanaPage onNavigate={setCurrentPage} />
            )}

            {currentPage === 'data-kejadian' && (
              <DataKejadianPage onNavigate={setCurrentPage} />
            )}

            {currentPage === 'register' && (
              <RegisterPage onNavigate={setCurrentPage} />
            )}

            {currentPage === 'login' && (
              <LoginPage
                onNavigate={setCurrentPage}
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  if (user.peran === 'Admin') {
                    setCurrentPage('dashboard-admin');
                  } else {
                    setCurrentPage('dashboard');
                  }
                }}
              />
            )}
          </main>

          {/* Footer (hidden on register and login pages for clean focused screen) */}
          {!isAuthPage && <Footer onNavigate={setCurrentPage} />}
        </div>
      )}
    </div>
  );
}
