import React from 'react';
import { PageId } from '../types';
import { Shield, Info, PhoneCall, Globe, FileText, HelpCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-margin border-t border-surface-container">
      <div className="max-w-7xl mx-auto px-gutter py-space-xl">
        {/* Official Notice Banner */}
        <div className="p-space-md bg-surface-container-low rounded-xl mb-space-lg border border-surface-container">
          <div className="flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-headline-md shrink-0 mt-0.5">info</span>
            <div className="flex-1">
              <p className="font-title-md text-title-md text-on-surface mb-1 font-bold">
                Pemberitahuan Sistem &amp; Batasan Data
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                PantauBencana menyajikan visualisasi data historis banjir dan tanah longsor di Indonesia berdasarkan dataset terverifikasi Otoritas PantauBencana. Bukan sistem peringatan dini (early warning) instan atau prediksi cuaca tunggal.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg pb-space-lg">
          {/* Col 1 */}
          <div className="space-y-space-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary-container flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-title-md text-title-md text-primary font-bold">PantauBencana</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Pusat integrasi data spasial dan catatan kronik bencana geo-hidrometeorologi untuk riset, mitigasi daerah, dan edukasi kesiapsiagaan publik.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('dashboard-admin')}
                className="text-xs text-secondary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Akses Portal Admin</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-space-xs">
            <p className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider">Data &amp; Lisensi</p>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button onClick={() => onNavigate('data-kejadian')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Format Data Terbuka (CSV/GeoJSON)
                </button>
              </li>
              <li>
                <a href="#license" onClick={(e) => { e.preventDefault(); alert('Lisensi Data Simulasi - Hak Cipta Otoritas PantauBencana.'); }} className="hover:text-primary transition-colors">
                  Lisensi Data Simulasi
                </a>
              </li>
              <li>
                <a href="#methodology" onClick={(e) => { e.preventDefault(); alert('Metodologi Verifikasi Internal: 3 tahap berjenjang melalui koordinasi Tim Pemantau Wilayah, rekonsiliasi citra satelit, dan konfirmasi akhir Tim Administrator Pusat.'); }} className="hover:text-primary transition-colors">
                  Metodologi Verifikasi Internal
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-space-xs">
            <p className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider">Bantuan &amp; Panduan</p>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <button onClick={() => onNavigate('peta-bencana')} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Petunjuk Penggunaan Peta Interaktif
                </button>
              </li>
              <li>
                <a href="#glossary" onClick={(e) => { e.preventDefault(); alert('Kamus Indikator Bencana: Definisi baku istilah hidrometeorologi, tinggi muka air, dan status tanggap darurat.'); }} className="hover:text-primary transition-colors">
                  Kamus Indikator Bencana
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => { e.preventDefault(); alert('FAQ: Data di portal ini disinkronisasi berkala dari sistem informasi penanggulangan bencana.'); }} className="hover:text-primary transition-colors">
                  Pertanyaan Umum (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-space-xs">
            <p className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wider">Kontak Bantuan &amp; Darurat</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Untuk kebutuhan informasi bantuan insiden dan layanan siaga bencana:
            </p>
            <div className="flex items-center gap-space-xs text-error font-headline-md text-headline-md pt-1">
              <span className="material-symbols-outlined">call</span>
              <span className="font-bold text-base sm:text-lg">Call Center Bantuan: 0800-000-0000</span>
            </div>
            <span className="text-[11px] text-on-surface-variant block">Layanan Bebas Pulsa 24 Jam Siaga</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-space-md border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024–2026 PantauBencana Indonesia. Inisiatif Data Terbuka Kebencanaan Nasional.
          </p>
          <div className="flex items-center gap-space-md font-label-md text-label-md text-on-surface-variant">
            <span className="hover:text-on-surface cursor-pointer" onClick={() => alert('Kebijakan Privasi: Perlindungan data pengguna sesuai UU Perlindungan Data Pribadi.')}>Privasi</span>
            <span className="hover:text-on-surface cursor-pointer" onClick={() => alert('Syarat Layanan: Penggunaan data untuk tujuan edukasi dan publikasi non-komersial.')}>Syarat Layanan</span>
            <span className="hover:text-on-surface cursor-pointer text-emerald-600 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              API Normal 100%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
