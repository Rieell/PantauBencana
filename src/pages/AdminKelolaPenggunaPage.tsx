import React, { useEffect, useState } from 'react';
import { PageId, UserAccount } from '../types';
import { Pagination } from '../components/Pagination';
import { PAGE_SIZE } from '../data/constants';
import { api, pesanError, UserPage } from '../lib/api';
import { formatAngka, useDebounced } from '../lib/hooks';
import { Search, Plus, Download, KeyRound, CheckCircle2, RotateCcw, X, UserCheck, Shield, Users, Lock, Save, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

interface AdminKelolaPenggunaPageProps {
  onNavigate: (page: PageId) => void;
}

// Warna avatar ditentukan dari ID supaya konsisten untuk tiap akun
const AVATAR_COLORS = [
  'bg-[#00288e] text-white',
  'bg-[#5bb8fe] text-[#001d31]',
  'bg-[#7d3600] text-white',
  'bg-[#1e40af] text-white',
  'bg-[#006398] text-white',
];
const warnaAvatar = (id: string) => AVATAR_COLORS[(parseInt(id, 10) || 0) % AVATAR_COLORS.length];

const formatTanggal = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const AdminKelolaPenggunaPage: React.FC<AdminKelolaPenggunaPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'user'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data pengguna dari tabel users (10 baris per halaman)
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ semua: 0, admin: 0, user: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const debouncedSearch = useDebounced(searchQuery);
  // Tab punya prioritas; kalau tab "Semua", dropdown peran yang dipakai
  const roleParam = activeTab !== 'all' ? activeTab : roleFilter.toLowerCase();

  // Modal Reset Password
  const [resetTarget, setResetTarget] = useState<UserAccount | null>(null);

  // Modal Tambah Pengguna
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPeran, setNewPeran] = useState<'Admin' | 'User'>('User');
  const [createError, setCreateError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  useEffect(() => {
    setCurrentPageNum(1);
  }, [debouncedSearch, roleParam]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage('');
    const query = new URLSearchParams({ page: String(currentPageNum), pageSize: String(PAGE_SIZE) });
    if (roleParam) query.set('role', roleParam);
    if (debouncedSearch.trim()) query.set('q', debouncedSearch.trim());

    api<UserPage>(`/api/users?${query.toString()}`, { signal: controller.signal })
      .then((res) => {
        setUsers(res.data);
        setTotalRows(res.total);
        setTotalPages(res.totalPages);
        setCounts(res.counts);
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setErrorMessage(pesanError(err));
        setUsers([]);
        setTotalRows(0);
        setTotalPages(1);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [currentPageNum, roleParam, debouncedSearch, refreshTick]);

  const startRow = totalRows === 0 ? 0 : (currentPageNum - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPageNum * PAGE_SIZE, totalRows);

  const handleResetPassword = () => {
    if (!resetTarget) return;
    showToast(`Tautan atur ulang kata sandi baru untuk ${resetTarget.nama} (${resetTarget.email}) berhasil dikirim.`);
    setResetTarget(null);
  };

  const openCreateModal = () => {
    setNewNama('');
    setNewEmail('');
    setNewPassword('');
    setShowNewPassword(false);
    setNewPeran('User');
    setCreateError('');
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!isSaving) setCreateModalOpen(false);
  };

  // Simpan akun baru ke tabel users di database
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (newPassword.length < 8) {
      setCreateError('Kata sandi minimal 8 karakter.');
      return;
    }
    setIsSaving(true);
    try {
      const created = await api<UserAccount>('/api/users', {
        method: 'POST',
        body: { nama: newNama.trim(), email: newEmail.trim(), password: newPassword, peran: newPeran },
      });
      setCreateModalOpen(false);
      showToast(`Akun pengguna baru ${created.nama} berhasil ditambahkan ke database!`);
      // Tampilkan pengguna terbaru di halaman pertama
      setActiveTab('all');
      setRoleFilter('');
      setSearchQuery('');
      setCurrentPageNum(1);
      setRefreshTick((t) => t + 1);
    } catch (err) {
      setCreateError(pesanError(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Ekspor semua pengguna sesuai filter (bukan hanya halaman yang tampil)
  const handleExportUsers = async () => {
    try {
      const query = new URLSearchParams({ page: '1', pageSize: '1000' });
      if (roleParam) query.set('role', roleParam);
      if (debouncedSearch.trim()) query.set('q', debouncedSearch.trim());
      const res = await api<UserPage>(`/api/users?${query.toString()}`);

      const headers = ['ID', 'Nama', 'Email', 'Peran', 'Tanggal Register'];
      const csvRows = res.data.map((u) => [u.id, `"${u.nama.replace(/"/g, '""')}"`, `"${u.email}"`, u.peran, `"${formatTanggal(u.tanggalRegister)}"`]);
      const csvContent = '\uFEFF' + [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');
      const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pantau_bencana_pengguna.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(`Gagal mengekspor: ${pesanError(err)}`);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 text-left">
      {/* Toast */}
      {toastMessage && (
        <aside className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#233144] text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col pr-2">
            <span className="font-bold">Aksi Berhasil</span>
            <span className="text-gray-300">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-gray-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-fixed text-[#001d31] text-[11px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>MANAJEMEN PENGGUNA TERDAFTAR • Hak Akses &amp; Akun</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Kelola Pengguna &amp; Administrator
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Katalog dan manajemen akun terdaftar pada sistem PantauBencana, mencakup Pengguna Publik dan Administrator/Petugas Kebencanaan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-center">
          <button
            onClick={handleExportUsers}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white text-primary hover:bg-surface-container-low transition-colors text-xs font-semibold shadow-xs border border-surface-container cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Data Pengguna</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-white hover:bg-primary transition-colors text-xs font-semibold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Ringkasan Akun */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Akun Terdaftar
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold">
              {formatAngka(counts.semua)} <span className="text-xs font-normal text-on-surface-variant">Akun</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary font-semibold">
              <span className="material-symbols-outlined text-sm">database</span>
              <span>Tersimpan di database</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Administrator &amp; Petugas
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold">
              {formatAngka(counts.admin)} <span className="text-xs font-normal text-on-surface-variant">Petugas</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Akses penuh kelola data &amp; pengguna</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Pengguna Publik
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold">
              {formatAngka(counts.user)} <span className="text-xs font-normal text-on-surface-variant">Akun</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
              <span>Akun yang mendaftar lewat halaman Register</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Tabs & Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-surface-container space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Semua Pengguna <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">{counts.semua}</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Administrator &amp; Petugas <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">{counts.admin}</span>
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'user'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pengguna Publik <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">{counts.user}</span>
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-outline absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan email, nama akun, atau ID..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline text-xs rounded-lg border border-surface-container focus:outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface text-xs py-2 px-3 rounded-lg border border-surface-container focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="">Semua Peran</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('');
                setActiveTab('all');
              }}
              className="w-full p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors border border-surface-container cursor-pointer"
              title="Reset Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data Registrasi Pengguna & Admin */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-semibold tracking-wider border-b border-surface-container">
                <th className="py-3 px-4">NAMA PENGGUNA</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">PERAN</th>
                <th className="py-3 px-4">TANGGAL REGISTER</th>
                <th className="py-3 px-4 text-right">RESET PASSWORD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {users.map((user) => {
                const initials = user.nama
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                const isAdmin = user.peran === 'Admin';

                return (
                  <tr key={user.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            warnaAvatar(user.id)
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-xs">{user.nama}</span>
                          <span className="text-[10px] text-outline">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                      {user.email}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          isAdmin ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-primary' : 'bg-outline'}`}></span>
                        {user.peran}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                      {formatTanggal(user.tanggalRegister)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setResetTarget(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors text-[11px] font-semibold cursor-pointer border border-surface-container"
                        type="button"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Reset Password</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!isLoading && users.length === 0 && (
            <div className="py-10 px-4 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
              {errorMessage && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{errorMessage || 'Tidak ada pengguna yang cocok dengan pencarian.'}</span>
            </div>
          )}
          {isLoading && users.length === 0 && (
            <div className="py-10 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memuat pengguna dari database...</span>
            </div>
          )}
        </div>

        {/* Paginasi & Kontrol Baris */}
        <div className="px-4 py-3 bg-white border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              Menampilkan{' '}
              <span className="font-semibold text-on-surface">
                {totalRows === 0 ? '0' : `${formatAngka(startRow)} - ${formatAngka(endRow)}`}
              </span>{' '}
              dari <span className="font-semibold text-on-surface">{formatAngka(totalRows)}</span> Pengguna
            </span>
          </div>

          <Pagination page={currentPageNum} totalPages={totalPages} onChange={setCurrentPageNum} disabled={isLoading} />
        </div>
      </div>

      {/* Modal Reset Password */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setResetTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-container p-6 space-y-4 text-xs text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-on-surface">Reset Kata Sandi Pengguna</h3>
                <p className="text-on-surface-variant">Kirim tautan pemulihan kata sandi resmi</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-3 rounded-xl space-y-1.5 border border-surface-container text-xs">
              <div>
                <span className="text-outline text-[11px] block">Akun Pengguna:</span>
                <span className="font-bold text-on-surface">{resetTarget.nama}</span>
              </div>
              <div>
                <span className="text-outline text-[11px] block">Email Terdaftar:</span>
                <span className="font-semibold text-primary">{resetTarget.email}</span>
              </div>
              <div>
                <span className="text-outline text-[11px] block">Peran Sistem:</span>
                <span className="font-medium text-on-surface">{resetTarget.peran}</span>
              </div>
            </div>

            <p className="text-on-surface-variant leading-relaxed text-xs">
              Sistem akan membuat token reset sandi satu kali pakai dan mengirimkannya ke alamat email di atas. Pengguna akan diminta membuat kata sandi baru dalam 24 jam.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Kirim Tautan Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna Baru */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={closeCreateModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-primary-container w-full"></div>

            <div className="p-6 flex items-center justify-between border-b border-surface-container">
              <div>
                <h3 className="text-base font-bold text-on-surface">Tambah Pengguna Baru</h3>
                <p className="text-xs text-on-surface-variant">Buat akun untuk staf pemantau atau publik</p>
              </div>
              <button type="button" onClick={closeCreateModal} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Ir. Bambang Suwondo"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nama@email.id"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs focus:bg-white"
                />
              </div>

              {createError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Peran Akses</label>
                  <select
                    value={newPeran}
                    onChange={(e) => setNewPeran(e.target.value as 'Admin' | 'User')}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs cursor-pointer"
                  >
                    <option value="User">User (Pengguna Publik)</option>
                    <option value="Admin">Admin (Petugas Wilayah/Pusat)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Kata Sandi</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                      autoComplete="new-password"
                      className="w-full px-3 pr-9 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 text-outline hover:text-on-surface cursor-pointer"
                      title={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant border border-surface-container">
                Kata sandi disimpan terenkripsi (bcrypt) di tabel <code>users</code>. Sampaikan kata sandi ini kepada pengguna agar bisa masuk.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengguna'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
