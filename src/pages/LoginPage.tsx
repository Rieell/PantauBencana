import React, { useState } from 'react';
import { PageId, UserAccount } from '../types';
import { Shield, Lock, Eye, EyeOff, Mail, LogIn, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('raditya.pratama@bnpb.go.id');
  const [password, setPassword] = useState('admin12345');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    setStatusText('Memverifikasi kredensial otoritas pusat...');

    setTimeout(() => {
      setIsLoading(false);
      const isAdmin = email.includes('pantaubencana.id') || email.includes('admin');
      const user: UserAccount = {
        id: isAdmin ? 'USR-001' : 'USR-003',
        nama: isAdmin ? 'Dr. Raditya Pratama' : 'Budi Santoso',
        email: email,
        peran: isAdmin ? 'Admin' : 'User',
        tanggalRegister: '12 Jan 2024',
        instansi: isAdmin ? 'Tim Administrator Pusat' : 'Masyarakat Umum',
        avatarColor: isAdmin ? 'bg-[#00288e] text-white' : 'bg-[#e6eeff] text-[#0d1c2e]',
        status: 'Aktif'
      };

      onLoginSuccess(user);
      setStatusText('Sesi terautentikasi. Mengarahkan ke Dashboard...');
      setTimeout(() => {
        if (isAdmin) {
          onNavigate('dashboard-admin');
        } else {
          onNavigate('beranda');
        }
      }, 700);
    }, 900);
  };

  const handleDemoAdmin = () => {
    setEmail('admin@pantaubencana.id');
    setPassword('admin12345');
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  const handleDemoUser = () => {
    setEmail('budi.santoso@email.com');
    setPassword('user12345');
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-4 overflow-hidden border border-surface-container">
          {/* Top Decorative Gradient Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-secondary-container"></div>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-1.5 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-headline-md text-[24px] font-bold text-primary tracking-tight">
                Pantau<span className="text-secondary">Bencana</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low text-secondary rounded-full border border-surface-container">
              <span className="material-symbols-outlined text-sm">public</span>
              <span className="font-label-sm text-[11px] uppercase tracking-wider font-semibold">Portal Akses Terpadu</span>
            </div>

            <h1 className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
              Masuk ke Akun Anda
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant max-w-sm">
              Masuk untuk mengakses laporan bencana, pemantauan wilayah, dan layanan PantauBencana.
            </p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-[11px] text-on-surface-variant font-medium text-left">
              <span className="font-semibold text-on-surface">Uji Coba Cepat:</span>
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="flex-1 sm:flex-none text-[11px] px-2.5 py-1.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>Akun Administrator</span>
              </button>
              <button
                type="button"
                onClick={handleDemoUser}
                className="flex-1 sm:flex-none text-[11px] px-2.5 py-1.5 bg-white border border-surface-container text-on-surface rounded-lg font-semibold hover:bg-surface-container transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3 h-3 text-secondary" />
                <span>Akun Pengguna</span>
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
              <span className="material-symbols-outlined text-sm text-red-600">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status feedback */}
          {statusText && (
            <div className="p-3 rounded-lg bg-surface-container flex items-center gap-2.5 text-on-surface text-xs border border-surface-container">
              {isLoading ? (
                <span className="material-symbols-outlined text-secondary animate-spin text-sm">sync</span>
              ) : (
                <CheckCircle2 className="w-4 h-4 text-secondary" />
              )}
              <span className="font-medium">{statusText}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5 mt-1">
            {/* Email */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="font-label-md text-xs font-semibold text-on-surface" htmlFor="identifierInput">
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-outline pointer-events-none" />
                <input
                  id="identifierInput"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full h-11 pl-10 pr-4 bg-white text-on-surface font-body-md text-sm rounded-lg border border-surface-container shadow-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-xs font-semibold text-on-surface" htmlFor="passwordInput">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => alert('Fitur pemulihan kata sandi telah dikirim ke email terdaftar.')}
                  className="text-xs text-secondary hover:underline cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-outline pointer-events-none" />
                <input
                  id="passwordInput"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-white text-on-surface font-body-md text-sm rounded-lg border border-surface-container shadow-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 rounded text-outline hover:text-on-surface focus:outline-none flex items-center justify-center transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                />
                <span className="font-body-sm text-xs text-on-surface">Ingat sesi masuk ini selama 7 hari</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-white font-label-lg text-sm font-semibold rounded-lg shadow-md hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-75"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          {/* Register Link */}
          <div className="flex items-center justify-center gap-1.5 py-1 text-center font-body-sm text-xs text-on-surface-variant">
            <span>Belum punya akun?</span>
            <button
              onClick={() => onNavigate('register')}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Daftar Sekarang
            </button>
          </div>

          {/* Operational status */}
          <div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg text-on-surface-variant border border-surface-container text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Pusat Data Siaga Aktif</span>
            </div>
            <span className="text-outline text-[11px]">Pusdatin v3.8.2</span>
          </div>

          {/* Back link */}
          <div className="flex flex-col items-center text-center pt-2 border-t border-surface-container">
            <button
              onClick={() => onNavigate('beranda')}
              className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Publik PantauBencana</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
