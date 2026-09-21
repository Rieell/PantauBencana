import React, { useState } from 'react';
import { PageId, DisasterRecord, CsvImportLog } from '../types';
import { INITIAL_CSV_LOGS } from '../data/mockData';
import { Shield, Plus, Upload, Download, FileText, CheckCircle2, AlertTriangle, TrendingUp, Users, Database, Clock, RefreshCw, X, Save } from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: PageId) => void;
  disasters: DisasterRecord[];
  onAddDisaster: (newRecord: DisasterRecord) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate, disasters, onAddDisaster }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterChartType, setFilterChartType] = useState<'all' | 'banjir' | 'longsor'>('all');

  // Form state for new disaster
  const [jenis, setJenis] = useState('Banjir');
  const [tanggal, setTanggal] = useState('2024-06-12');
  const [waktu, setWaktu] = useState('08:30 WIB');
  const [provinsi, setProvinsi] = useState('Jawa Tengah');
  const [kabupatenKota, setKabupatenKota] = useState('');
  const [koordinat, setKoordinat] = useState('-6.8943, 110.6385');
  const [statusVerifikasi, setStatusVerifikasi] = useState<'Terverifikasi Otoritas PantauBencana' | 'Validasi Analis Penuh' | 'Menunggu Validasi Lapangan'>('Terverifikasi Otoritas PantauBencana');
  const [penyebab, setPenyebab] = useState('');
  const [dampak, setDampak] = useState('');
  const [korbanMeninggal, setKorbanMeninggal] = useState(0);
  const [korbanLuka, setKorbanLuka] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveDisaster = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = koordinat.split(',').map((p) => parseFloat(p.trim()));
    const lat = isNaN(parts[0]) ? -7.0 : parts[0];
    const lon = isNaN(parts[1]) ? 110.0 : parts[1];

    const newRecord: DisasterRecord = {
      id: `BNC-${Date.now().toString().slice(-6)}`,
      tanggal: new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      tanggalIso: tanggal,
      waktu: waktu,
      jenis: jenis,
      kabupatenKota: kabupatenKota || 'Demak',
      provinsi: provinsi,
      ringkasanDampak: dampak || `${korbanMeninggal} meninggal · ${korbanLuka} luka`,
      penyebab: penyebab || 'Curah hujan ekstrem',
      latitude: lat,
      longitude: lon,
      statusVerifikasi: statusVerifikasi,
      korbanMeninggal: Number(korbanMeninggal),
      korbanLuka: Number(korbanLuka),
      tingkatRisiko: korbanMeninggal > 5 ? 'Tinggi' : 'Sedang',
      deskripsiDetail: `Input data dari administrator melalui portal operasional. ${dampak}`,
    };

    onAddDisaster(newRecord);
    setModalOpen(false);
    showToast('Data kejadian bencana baru berhasil disimpan dan masuk ke basis data!');
    // Reset
    setKabupatenKota('');
    setDampak('');
    setPenyebab('');
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#233144] text-white shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-surface-container">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 top-10 h-32 w-32 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 border border-surface-container">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-xs text-primary font-bold uppercase tracking-wider">
                ADMINISTRATOR PORTAL PUSDALOPS
              </span>
            </div>

            <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Selamat Datang kembali, Adi Putra
              <span className="text-sm text-secondary block sm:inline sm:ml-2 font-normal">
                (Tim Administrator Pusat)
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <div className="inline-flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Status Basis Data: <strong className="text-on-surface">Terhubung Aktif</strong></span>
              </div>
              <span className="text-outline">•</span>
              <div className="inline-flex items-center gap-1.5 text-on-surface-variant">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>Terakhir disinkronisasi: <strong className="text-on-surface">Hari ini, 08:45 WIB</strong></span>
              </div>
              <span className="text-outline">•</span>
              <div className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                Klaster Pusdalops-Nas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Total Kejadian
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-lg text-2xl sm:text-3xl text-on-surface font-bold">14.820</span>
                <span className="text-xs text-on-surface-variant">Catatan</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low text-primary">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between">
            <div className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24 minggu ini</span>
            </div>
            <span className="text-xs text-outline">Banjir &amp; Longsor</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Jumlah Pengguna
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-lg text-2xl sm:text-3xl text-on-surface font-bold">1.248</span>
                <span className="text-xs text-on-surface-variant">Akun</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low text-secondary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs text-secondary bg-surface-container px-2 py-0.5 rounded font-semibold">
              Petugas &amp; Tim Pemantau Wilayah
            </span>
            <span className="text-xs text-outline">Aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Korban Jiwa &amp; Terdampak
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-lg text-2xl sm:text-3xl text-red-600 font-bold">4.829</span>
                <span className="text-xs text-on-surface-variant">Jiwa</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between">
            <span className="text-xs text-red-700 font-medium">Kumulatif Nasional</span>
            <span className="text-xs text-outline">Pusdatin</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Infrastruktur Rusak
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-lg text-2xl sm:text-3xl text-secondary font-bold">342.180</span>
                <span className="text-xs text-on-surface-variant">Unit</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary-fixed text-secondary">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Rumah &amp; Fasilitas Publik</span>
            <span className="text-xs text-outline">100% Valid</span>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-surface-container space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              <h2 className="font-headline-md text-xl text-on-surface font-bold">
                Tren Tahunan Bencana &amp; Korban Jiwa (2018 - 2024)
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-secondary">
                Historis Terverifikasi
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Jumlah kejadian semua bencana per tahun serta akumulasi korban terdampak nasional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container text-xs font-semibold text-primary">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Semua Jenis Bencana
            </span>
          </div>
        </div>

        {/* 2 Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Bar Chart */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-title-md text-sm text-on-surface font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">bar_chart</span>
                    Tren Kejadian Bencana per Tahun
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Jumlah kejadian semua bencana per tahun</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#1e40af] inline-block"></span>
                    <span className="text-on-surface-variant text-[11px] font-medium">Total Insiden</span>
                  </div>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="w-full h-52 relative">
                <svg className="w-full h-full" viewBox="0 0 540 180" fill="none">
                  <line x1="40" y1="30" x2="520" y2="30" stroke="#d5e3fc" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="32" y="34" fill="#757684" fontSize="10" textAnchor="end">5.000</text>
                  <line x1="40" y1="75" x2="520" y2="75" stroke="#d5e3fc" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="32" y="79" fill="#757684" fontSize="10" textAnchor="end">3.000</text>
                  <line x1="40" y1="120" x2="520" y2="120" stroke="#d5e3fc" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="32" y="124" fill="#757684" fontSize="10" textAnchor="end">1.000</text>
                  <line x1="40" y1="145" x2="520" y2="145" stroke="#c4c5d5" strokeWidth="1" />

                  {/* Bars */}
                  <g>
                    <rect x="62" y="68" width="14" height="77" rx="3" fill="#1e40af" />
                    <rect x="78" y="102" width="14" height="43" rx="3" fill="#5bb8fe" />
                    <text x="77" y="61" fill="#0d1c2e" fontSize="10" fontWeight="600" textAnchor="middle">3.420</text>
                    <text x="77" y="160" fill="#444653" fontSize="11" textAnchor="middle">2018</text>
                  </g>
                  <g>
                    <rect x="128" y="58" width="14" height="87" rx="3" fill="#1e40af" />
                    <rect x="144" y="95" width="14" height="50" rx="3" fill="#5bb8fe" />
                    <text x="143" y="51" fill="#0d1c2e" fontSize="10" fontWeight="600" textAnchor="middle">3.890</text>
                    <text x="143" y="160" fill="#444653" fontSize="11" textAnchor="middle">2019</text>
                  </g>
                  <g>
                    <rect x="194" y="41" width="14" height="104" rx="3" fill="#1e40af" />
                    <rect x="210" y="88" width="14" height="57" rx="3" fill="#5bb8fe" />
                    <text x="209" y="34" fill="#0d1c2e" fontSize="10" fontWeight="600" textAnchor="middle">4.650</text>
                    <text x="209" y="160" fill="#444653" fontSize="11" textAnchor="middle">2020</text>
                  </g>
                  <g>
                    <rect x="260" y="32" width="14" height="113" rx="3" fill="#1e40af" />
                    <rect x="276" y="80" width="14" height="65" rx="3" fill="#5bb8fe" />
                    <text x="275" y="25" fill="#00288e" fontSize="10" fontWeight="700" textAnchor="middle">5.120</text>
                    <text x="275" y="160" fill="#00288e" fontSize="11" fontWeight="700" textAnchor="middle">2021</text>
                  </g>
                  <g>
                    <rect x="326" y="46" width="14" height="99" rx="3" fill="#1e40af" />
                    <rect x="342" y="92" width="14" height="53" rx="3" fill="#5bb8fe" />
                    <text x="341" y="39" fill="#0d1c2e" fontSize="10" fontWeight="600" textAnchor="middle">4.410</text>
                    <text x="341" y="160" fill="#444653" fontSize="11" textAnchor="middle">2022</text>
                  </g>
                  <g>
                    <rect x="392" y="36" width="14" height="109" rx="3" fill="#1e40af" />
                    <rect x="408" y="86" width="14" height="59" rx="3" fill="#5bb8fe" />
                    <text x="407" y="29" fill="#0d1c2e" fontSize="10" fontWeight="600" textAnchor="middle">4.880</text>
                    <text x="407" y="160" fill="#444653" fontSize="11" textAnchor="middle">2023</text>
                  </g>
                  <g>
                    <rect x="458" y="92" width="14" height="53" rx="3" fill="#1e40af" />
                    <rect x="474" y="116" width="14" height="29" rx="3" fill="#5bb8fe" />
                    <text x="473" y="85" fill="#0d1c2e" fontSize="10" fontWeight="600" textAnchor="middle">2.403*</text>
                    <text x="473" y="160" fill="#444653" fontSize="11" textAnchor="middle">2024</text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white flex items-center justify-between text-xs border border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-sm">flag</span>
                <span>Puncak bencana pada <strong>2021 (5.120 insiden)</strong></span>
              </div>
              <span className="text-outline text-[11px]">*Data 2024 per kuartal berjalan</span>
            </div>
          </div>

          {/* Chart 2: Area / Line Chart */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-title-md text-sm text-on-surface font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-base">show_chart</span>
                    Tren Korban Jiwa &amp; Terdampak
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Data akumulasi jiwa terdampak dan korban meninggal</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                    <span className="text-on-surface-variant text-[11px]">Meninggal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e40af] inline-block"></span>
                    <span className="text-on-surface-variant text-[11px]">Terdampak (K)</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-52 relative">
                <svg className="w-full h-full" viewBox="0 0 540 180" fill="none">
                  <defs>
                    <linearGradient id="adminImpactGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e40af" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="40" y1="30" x2="520" y2="30" stroke="#d5e3fc" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="32" y="34" fill="#757684" fontSize="10" textAnchor="end">3.000</text>
                  <line x1="40" y1="75" x2="520" y2="75" stroke="#d5e3fc" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="32" y="79" fill="#757684" fontSize="10" textAnchor="end">2.000</text>
                  <line x1="40" y1="120" x2="520" y2="120" stroke="#d5e3fc" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="32" y="124" fill="#757684" fontSize="10" textAnchor="end">1.000</text>
                  <line x1="40" y1="145" x2="520" y2="145" stroke="#c4c5d5" strokeWidth="1" />

                  {/* Curves */}
                  <path d="M 77 145 L 77 82 L 143 105 L 209 72 L 275 38 L 341 90 L 407 98 L 473 124 L 473 145 Z" fill="url(#adminImpactGrad)" />
                  <path d="M 77 82 L 143 105 L 209 72 L 275 38 L 341 90 L 407 98 L 473 124" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 77 108 L 143 120 L 209 98 L 275 75 L 341 112 L 407 118 L 473 132" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />

                  {/* Dots */}
                  {[
                    [77, 82], [143, 105], [209, 72], [275, 38], [341, 90], [407, 98], [473, 124]
                  ].map(([cx, cy], i) => (
                    <circle key={`impact-${i}`} cx={cx} cy={cy} r="3.5" fill="#1e40af" />
                  ))}
                  {[
                    [77, 108], [143, 120], [209, 98], [275, 75], [341, 112], [407, 118], [473, 132]
                  ].map(([cx, cy], i) => (
                    <circle key={`fatal-${i}`} cx={cx} cy={cy} r="3" fill="#ba1a1a" />
                  ))}

                  <text x="77" y="160" fill="#444653" fontSize="11" textAnchor="middle">2018</text>
                  <text x="143" y="160" fill="#444653" fontSize="11" textAnchor="middle">2019</text>
                  <text x="209" y="160" fill="#444653" fontSize="11" textAnchor="middle">2020</text>
                  <text x="275" y="160" fill="#00288e" fontSize="11" fontWeight="700" textAnchor="middle">2021</text>
                  <text x="341" y="160" fill="#444653" fontSize="11" textAnchor="middle">2022</text>
                  <text x="407" y="160" fill="#444653" fontSize="11" textAnchor="middle">2023</text>
                  <text x="473" y="160" fill="#444653" fontSize="11" textAnchor="middle">2024</text>
                </svg>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white flex items-center justify-between text-xs border border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-600 text-sm">person_remove</span>
                <span>Rata-rata korban jiwa: <strong>1.700 jiwa/tahun</strong></span>
              </div>
              <span className="text-secondary font-semibold">Tren melandai di 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Log Aktivitas Impor & Unggah Terakhir */}
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-surface-container space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">file_download_done</span>
              <h2 className="font-headline-md text-xl text-on-surface font-bold">
                Aktivitas Impor &amp; Unggah Terakhir
              </h2>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Log batch unggahan format CSV kebencanaan dari Tim Pemantau Wilayah
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Memuat log arsip file batch terbaru...')}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-secondary flex items-center gap-1 cursor-pointer border border-surface-container"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkronkan Arsip</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {INITIAL_CSV_LOGS.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-container"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${log.status === 'Sebagian Gagal' ? 'bg-amber-100 text-amber-900' : 'bg-surface-container-highest text-primary'}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {log.status === 'Sebagian Gagal' ? 'warning' : 'csv'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-on-surface text-sm">{log.namaFile}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Sebagian Gagal'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-surface-container-high text-primary'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <p className="text-on-surface-variant">
                    <strong className="text-on-surface">{log.barisSukses} baris sukses</strong>
                    {log.barisGagal > 0 ? (
                      <span className="text-red-600 font-semibold"> • {log.barisGagal} baris gagal koordinat</span>
                    ) : (
                      ' • 0 baris gagal'
                    )}{' '}
                    • Diimpor oleh {log.diimporOleh}
                  </p>

                  <div className="text-[11px] text-outline pt-0.5">
                    Ukuran: {log.ukuran} • Wilayah: {log.wilayah} • {log.waktu}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => alert(`Detail log untuk file: ${log.namaFile}\nDiproses pada ${log.waktu}\nWilayah: ${log.wilayah}`)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors border border-surface-container cursor-pointer"
                >
                  Lihat Log
                </button>
                <button
                  onClick={() => showToast(`Mengunduh berkas ${log.namaFile}...`)}
                  className="p-1.5 rounded-lg bg-white hover:bg-surface-container-high text-secondary transition-colors border border-surface-container cursor-pointer"
                  title="Unduh file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Modal Input Data Kejadian Baru */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-surface-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-secondary w-full"></div>

            <div className="p-6 flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-container rounded-xl text-primary">
                  <span className="material-symbols-outlined text-2xl">add_location_alt</span>
                </div>
                <div>
                  <h3 className="font-title-lg text-lg text-on-surface font-bold">
                    Input Data Kejadian Bencana Baru
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Formulir terstandarisasi Tim Administrator Pusat untuk arsip historis &amp; monitoring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDisaster} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Jenis Kejadian Bencana</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  >
                    <option value="Banjir">Banjir Luapan / Genangan</option>
                    <option value="Tanah Longsor">Gerakan Tanah / Longsor</option>
                    <option value="Banjir Bandang">Banjir Bandang</option>
                    <option value="Cuaca Ekstrem">Cuaca Ekstrem / Puting Beliung</option>
                    <option value="Gelombang Pasang / Abrasi">Gelombang Pasang / Rob</option>
                    <option value="Erupsi Gunung Api">Erupsi Gunung Api</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Tanggal Kejadian</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Provinsi</label>
                  <select
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  >
                    <option>Jawa Tengah</option>
                    <option>Jawa Barat</option>
                    <option>Jawa Timur</option>
                    <option>Sulawesi Selatan</option>
                    <option>Sumatera Barat</option>
                    <option>Jambi</option>
                    <option>Papua</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Kabupaten / Kota</label>
                  <input
                    type="text"
                    required
                    value={kabupatenKota}
                    onChange={(e) => setKabupatenKota(e.target.value)}
                    placeholder="Contoh: Kab. Demak"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Koordinat Titik (Lat, Lon)</label>
                  <input
                    type="text"
                    value={koordinat}
                    onChange={(e) => setKoordinat(e.target.value)}
                    placeholder="-6.8943, 110.6385"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Status Verifikasi</label>
                  <select
                    value={statusVerifikasi}
                    onChange={(e) => setStatusVerifikasi(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  >
                    <option value="Terverifikasi Otoritas PantauBencana">Terverifikasi Otoritas PantauBencana</option>
                    <option value="Validasi Analis Penuh">Validasi Analis Penuh</option>
                    <option value="Menunggu Validasi Lapangan">Menunggu Validasi Lapangan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Korban Meninggal (Jiwa)</label>
                  <input
                    type="number"
                    value={korbanMeninggal}
                    onChange={(e) => setKorbanMeninggal(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-on-surface">Penyebab Bencana</label>
                  <input
                    type="text"
                    value={penyebab}
                    onChange={(e) => setPenyebab(e.target.value)}
                    placeholder="Contoh: Tanggul Sungai Wulan jebol"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-on-surface">Dampak Sementara &amp; Keterangan Lapangan</label>
                <textarea
                  rows={3}
                  value={dampak}
                  onChange={(e) => setDampak(e.target.value)}
                  placeholder="Deskripsikan ketinggian muka air, jumlah rumah terendam, serta fasilitas publik yang terdampak..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:bg-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan ke Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
