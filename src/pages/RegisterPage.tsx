import React, { useState } from 'react';
import { PageId, UserAccount } from '../types';
import { Shield, Lock, Eye, EyeOff, User, Mail, CheckCircle2, ArrowLeft, UserPlus } from 'lucide-react';
import { api, pesanError } from '../lib/api';

interface RegisterPageProps {
  onNavigate: (page: PageId) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 30;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  const strengthScore = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Kata sandi dan konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter.');
      return;
    }
    if (!agreedTerms) {
      setErrorMessage('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi.');
      return;
    }

    setIsLoading(true);
    try {
      // Akun disimpan ke tabel users di database (peran otomatis "user")
      await api<{ user: UserAccount }>('/api/auth/register', {
        method: 'POST',
        body: { nama: fullName.trim(), email: email.trim(), password },
      });
      setSuccessMessage('Pendaftaran Berhasil! Anda sekarang dapat masuk ke akun PantauBencana.');
      setTimeout(() => onNavigate('login'), 1500);
    } catch (err) {
      setErrorMessage(pesanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-xl shadow-surface-tint/5 border border-surface-container">
          {/* Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-container via-secondary to-tertiary"></div>

          {/* Header */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-headline-md text-[22px] font-bold text-primary tracking-tight">
                Pantau<span className="text-secondary">Bencana</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-[11px] tracking-wide uppercase mb-2 border border-surface-container">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              PENDAFTARAN AKUN PUBLIK
            </div>

            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1 font-bold">
              Buat Akun PantauBencana
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md leading-relaxed">
              Daftar untuk memantau risiko banjir &amp; longsor di wilayah Anda, simpan filter pencarian, dan dapatkan notifikasi waspada dini.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
              <span className="material-symbols-outlined text-sm text-red-600">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nama Lengkap */}
            <div className="flex flex-col gap-1 text-left">
              <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                <span>Nama Lengkap</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Raditya Pratama"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-white text-on-surface placeholder:text-outline font-body-md text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1 text-left">
              <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                <span>Alamat Surel (Email)</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-white text-on-surface placeholder:text-outline font-body-md text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Kata Sandi */}
              <div className="flex flex-col gap-1 text-left">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  <span>Kata Sandi</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full h-10 pl-9 pr-9 rounded-lg bg-white text-on-surface placeholder:text-outline font-body-md text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-outline hover:text-on-surface p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div className="flex flex-col gap-1 text-left">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                  <span>Konfirmasi Sandi</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full h-10 pl-9 pr-9 rounded-lg bg-white text-on-surface placeholder:text-outline font-body-md text-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 text-outline hover:text-on-surface p-1 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 flex-1 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthScore > 70 ? 'bg-emerald-500' : strengthScore > 40 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${strengthScore}%` }}
                ></div>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-secondary">verified_user</span>
                {strengthScore > 70 ? 'Sandi Kuat' : strengthScore > 40 ? 'Sandi Sedang' : 'Sandi Lemah'}
              </span>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 mt-1 text-left">
              <input
                id="reg-terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary-container border-gray-300 focus:ring-primary-container cursor-pointer"
              />
              <label htmlFor="reg-terms" className="font-body-sm text-xs text-on-surface-variant leading-tight select-none cursor-pointer">
                Saya menyetujui <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Ketentuan Layanan PantauBencana: Data digunakan untuk keselamatan sipil dan kepatuhan hukum.'); }} className="text-primary-container font-semibold hover:underline">Ketentuan Layanan</a> dan <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Kebijakan Privasi: Menjamin kerahasiaan identitas pengguna.'); }} className="text-primary-container font-semibold hover:underline">Kebijakan Privasi</a> PantauBencana Nasional.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary-container text-white font-title-md text-sm shadow-md hover:bg-primary transition-all duration-150 active:scale-[0.99] cursor-pointer mt-1 font-semibold disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Sekarang</span>
                </>
              )}
            </button>

            {/* Link to Login */}
            <div className="text-center pt-1">
              <p className="font-body-sm text-xs text-on-surface-variant">
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="font-semibold text-primary hover:underline cursor-pointer ml-1"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </form>

          {/* Footer Card Navigation */}
          <div className="mt-6 pt-4 border-t border-surface-container text-center">
            <button
              type="button"
              onClick={() => onNavigate('beranda')}
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors py-1 px-3 rounded-full hover:bg-surface-container-low cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Utama PantauBencana</span>
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 text-center flex items-center justify-center gap-2 text-on-surface-variant text-xs opacity-80">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>Sistem Terintegrasi PantauBencana • Keamanan Terenkripsi SSL/TLS</span>
        </div>
      </div>
    </div>
  );
};
