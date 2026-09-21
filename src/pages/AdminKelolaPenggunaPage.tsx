import React, { useState } from 'react';
import { PageId, UserAccount } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { Search, Plus, Download, KeyRound, CheckCircle2, RotateCcw, X, UserCheck, Shield, Users, Lock, Save, Trash2 } from 'lucide-react';

interface AdminKelolaPenggunaPageProps {
  onNavigate: (page: PageId) => void;
  users: UserAccount[];
  onAddUser: (newUser: UserAccount) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminKelolaPenggunaPage: React.FC<AdminKelolaPenggunaPageProps> = ({
  onNavigate,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'user'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Reset Password
  const [resetTarget, setResetTarget] = useState<UserAccount | null>(null);

  // Modal Tambah Pengguna
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPeran, setNewPeran] = useState<'Admin' | 'User'>('User');
  const [newInstansi, setNewInstansi] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'admin' && u.peran !== 'Admin') return false;
    if (activeTab === 'user' && u.peran !== 'User') return false;

    if (roleFilter && u.peran.toLowerCase() !== roleFilter.toLowerCase()) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.nama.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResetPassword = () => {
    if (!resetTarget) return;
    showToast(`Tautan atur ulang kata sandi baru untuk ${resetTarget.nama} (${resetTarget.email}) berhasil dikirim.`);
    setResetTarget(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newEmail) return;

    const initials = newNama
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const colors = [
      'bg-[#00288e] text-white',
      'bg-[#5bb8fe] text-[#001d31]',
      'bg-[#7d3600] text-white',
      'bg-[#1e40af] text-white',
      'bg-[#006398] text-white',
    ];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: UserAccount = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      nama: newNama,
      email: newEmail,
      peran: newPeran,
      tanggalRegister: `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      instansi: newInstansi || (newPeran === 'Admin' ? 'Tim Pemantau Wilayah' : 'Masyarakat Publik'),
      avatarColor: pickedColor,
      status: 'Aktif',
    };

    onAddUser(newUser);
    setCreateModalOpen(false);
    setNewNama('');
    setNewEmail('');
    setNewInstansi('');
    showToast(`Akun pengguna baru ${newUser.nama} berhasil ditambahkan!`);
  };

  const adminCount = users.filter((u) => u.peran === 'Admin').length;
  const userCount = users.filter((u) => u.peran === 'User').length;

  const handleExportUsers = () => {
    const headers = ['ID', 'Nama', 'Email', 'Peran', 'Tanggal Register', 'Instansi'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.nama}"`,
      `"${u.email}"`,
      u.peran,
      `"${u.tanggalRegister}"`,
      `"${u.instansi || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pantau_bencana_pengguna.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            onClick={() => setCreateModalOpen(true)}
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
              {users.length + 1420} <span className="text-xs font-normal text-on-surface-variant">Akun</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12 akun minggu ini</span>
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
              {adminCount + 20} <span className="text-xs font-normal text-on-surface-variant">Petugas</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>16 Tim Wilayah • 8 Administrator Pusat</span>
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
              {userCount + 1400} <span className="text-xs font-normal text-on-surface-variant">Akun</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
              <span>Pelapor &amp; Relawan Warga</span>
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
            Semua Pengguna <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">{users.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Administrator &amp; Petugas <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">{adminCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'user'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Pengguna Publik <span className="ml-1 px-1.5 py-0.2 rounded-full bg-surface-container text-[10px]">{userCount}</span>
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
              {filteredUsers.map((user) => {
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
                            user.avatarColor || (isAdmin ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800')
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface text-xs">{user.nama}</span>
                          <span className="text-[10px] text-outline">{user.instansi || 'Masyarakat'}</span>
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
                      {user.tanggalRegister}
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
        </div>

        {/* Paginasi & Kontrol Baris */}
        <div className="px-4 py-3 bg-white border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div>
            Menampilkan <span className="font-semibold text-on-surface">1 - {filteredUsers.length}</span> dari{' '}
            <span className="font-semibold text-on-surface">{users.length + 1420}</span> Pengguna
          </div>

          <div className="flex items-center gap-1">
            <button disabled className="px-2.5 py-1 rounded-lg text-on-surface-variant bg-surface-container-low opacity-50 cursor-not-allowed">
              Sebelumnya
            </button>
            <div className="flex items-center gap-1 mx-1">
              <button className="w-7 h-7 rounded-lg bg-primary-container text-white font-semibold flex items-center justify-center">
                1
              </button>
              <button className="w-7 h-7 rounded-lg text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded-lg text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center">
                3
              </button>
              <span className="px-1 text-outline">...</span>
              <button className="w-7 h-7 rounded-lg text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center">
                179
              </button>
            </div>
            <button className="px-2.5 py-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-semibold cursor-pointer">
              Berikutnya
            </button>
          </div>
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
          onClick={() => setCreateModalOpen(false)}
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
              <button onClick={() => setCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-semibold block mb-1">Instansi / Asal Wilayah</label>
                  <input
                    type="text"
                    value={newInstansi}
                    onChange={(e) => setNewInstansi(e.target.value)}
                    placeholder="Contoh: Tim Pemantau Jawa Barat"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant border border-surface-container">
                Kata sandi awal default sementara adalah <code>Bencana@2024</code>. Pengguna akan diminta mengubah kata sandi pada saat masuk pertama kali.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
