import React, { useEffect, useState } from 'react';
import { PageId, DisasterRecord } from '../types';
import { DisasterCarousel } from '../components/DisasterCarousel';
import { Pagination } from '../components/Pagination';
import { JENIS_BENCANA, PROVINSI_38, TAHUN_LIST, PAGE_SIZE, cocokkanPilihan } from '../data/constants';
import {
  api,
  DisasterPayload,
  fetchDisasters,
  hapusDisaster,
  pesanError,
  simpanDisaster,
  unduh,
  urlEkspor,
} from '../lib/api';
import { formatAngka, useDebounced, useSummary } from '../lib/hooks';
import { Search, Plus, Upload, Download, Trash2, Edit3, X, AlertTriangle, Lock, CheckCircle2, RotateCcw, Save, Loader2 } from 'lucide-react';

interface AdminKelolaDataPageProps {
  onNavigate: (page: PageId) => void;
  // Dipanggil setelah data berubah (tambah / ubah / hapus) supaya halaman lain ikut menyegarkan data
  onDataChanged?: () => void;
}

// Nilai form disimpan sebagai teks supaya kolom angka bisa dikosongkan saat mengetik
interface DisasterForm {
  id?: string; // kosong = data baru
  jenis: string;
  tanggalIso: string;
  provinsi: string;
  kabupatenKota: string;
  penyebab: string;
  korbanMeninggal: string;
  korbanHilang: string;
  korbanLuka: string;
  rumahRusak: string;
  rumahTerendam: string;
  fasilitasRusak: string;
}

const hariIni = () => {
  const d = new Date();
  const dua = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
};

const formKosong = (): DisasterForm => ({
  jenis: JENIS_BENCANA[0],
  tanggalIso: hariIni(),
  provinsi: '',
  kabupatenKota: '',
  penyebab: '',
  korbanMeninggal: '0',
  korbanHilang: '0',
  korbanLuka: '0',
  rumahRusak: '0',
  rumahTerendam: '0',
  fasilitasRusak: '0',
});

const formDariRecord = (r: DisasterRecord): DisasterForm => ({
  id: r.id,
  jenis: cocokkanPilihan(JENIS_BENCANA, r.jenis),
  tanggalIso: r.tanggalIso,
  provinsi: cocokkanPilihan(PROVINSI_38, r.provinsi),
  kabupatenKota: r.kabupatenKota,
  penyebab: r.penyebab === 'Tidak diketahui' ? '' : r.penyebab,
  korbanMeninggal: String(r.korbanMeninggal ?? 0),
  korbanHilang: String(r.korbanHilang ?? 0),
  korbanLuka: String(r.korbanLuka ?? 0),
  rumahRusak: String(r.rumahRusak ?? 0),
  rumahTerendam: String(r.rumahTerendam ?? 0),
  fasilitasRusak: String(r.fasilitasRusak ?? 0),
});

const inputCls = 'w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs focus:bg-white focus:outline-none';

export const AdminKelolaDataPage: React.FC<AdminKelolaDataPageProps> = ({ onNavigate, onDataChanged }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);

  // Data tabel dari database (10 baris per halaman)
  const [rows, setRows] = useState<DisasterRecord[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const summary = useSummary(refreshTick);
  const debouncedSearch = useDebounced(searchQuery);
  const filters = { q: debouncedSearch, jenis: typeFilter, provinsi: provinceFilter, tahun: yearFilter };

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DisasterRecord | null>(null);
  const [deleteAuthConfirmed, setDeleteAuthConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit / Add modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState<DisasterForm | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  // Import wizard modal
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Kembali ke halaman 1 setiap kali filter berubah
  useEffect(() => {
    setCurrentPageNum(1);
  }, [debouncedSearch, typeFilter, provinceFilter, yearFilter]);

  // Ambil 10 kejadian per halaman dari database
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage('');
    fetchDisasters(
      { q: debouncedSearch, jenis: typeFilter, provinsi: provinceFilter, tahun: yearFilter },
      currentPageNum,
      PAGE_SIZE,
      { cariId: true, signal: controller.signal }
    )
      .then((res) => {
        setRows(res.data);
        setTotalRows(res.total);
        setTotalPages(res.totalPages);
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setErrorMessage(pesanError(err));
        setRows([]);
        setTotalRows(0);
        setTotalPages(1);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [debouncedSearch, typeFilter, provinceFilter, yearFilter, currentPageNum, refreshTick]);

  // Saran nama kabupaten/kota sesuai provinsi yang dipilih di form
  const formProvinsi = form?.provinsi || '';
  useEffect(() => {
    if (!formProvinsi) {
      setCitySuggestions([]);
      return;
    }
    let batal = false;
    api<string[]>(`/api/disasters/cities?provinsi=${encodeURIComponent(formProvinsi)}`)
      .then((list) => !batal && setCitySuggestions(list))
      .catch(() => !batal && setCitySuggestions([]));
    return () => {
      batal = true;
    };
  }, [formProvinsi]);

  const startRow = totalRows === 0 ? 0 : (currentPageNum - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPageNum * PAGE_SIZE, totalRows);

  const afterDataChanged = () => {
    setRefreshTick((t) => t + 1);
    onDataChanged?.();
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteAuthConfirmed) return;
    setIsDeleting(true);
    try {
      await hapusDisaster(deleteTarget.id);
      showToast(`Catatan kejadian ${deleteTarget.id} (${deleteTarget.kabupatenKota}) berhasil dihapus dari database.`);
      // Kalau yang dihapus satu-satunya baris di halaman ini, mundur satu halaman
      if (rows.length === 1 && currentPageNum > 1) setCurrentPageNum(currentPageNum - 1);
      afterDataChanged();
      setDeleteTarget(null);
      setDeleteAuthConfirmed(false);
    } catch (err) {
      showToast(`Gagal menghapus: ${pesanError(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (record: DisasterRecord) => {
    setForm(formDariRecord(record));
    setFormError('');
    setEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setForm(formKosong());
    setFormError('');
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditModalOpen(false);
    setForm(null);
  };

  const setField = (field: keyof DisasterForm, value: string) => setForm((f) => (f ? { ...f, [field]: value } : f));

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setFormError('');
    setIsSaving(true);
    try {
      const payload: DisasterPayload = {
        jenis: form.jenis,
        tanggalIso: form.tanggalIso,
        kabupatenKota: form.kabupatenKota.trim(),
        provinsi: form.provinsi,
        penyebab: form.penyebab.trim(),
        korbanMeninggal: Number(form.korbanMeninggal) || 0,
        korbanHilang: Number(form.korbanHilang) || 0,
        korbanLuka: Number(form.korbanLuka) || 0,
        rumahRusak: Number(form.rumahRusak) || 0,
        rumahTerendam: Number(form.rumahTerendam) || 0,
        fasilitasRusak: Number(form.fasilitasRusak) || 0,
      };
      const saved = await simpanDisaster(payload, form.id);
      showToast(
        form.id
          ? `Catatan kejadian ${saved.id} berhasil diperbarui di database.`
          : `Catatan kejadian baru (ID ${saved.id}) berhasil disimpan ke database.`
      );
      setEditModalOpen(false);
      setForm(null);
      afterDataChanged();
    } catch (err) {
      setFormError(pesanError(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Ekspor CSV semua hasil filter (bukan hanya halaman yang tampil)
  const handleExportCsv = () => unduh(urlEkspor(filters, true));

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Toast Floating Notification */}
      {toastMessage && (
        <aside className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#233144] text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-2">
          <div className="w-8 h-8 rounded-full bg-secondary-container text-[#00476e] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col pr-2 text-xs">
            <span className="font-bold">Pembaruan Berhasil</span>
            <span className="text-gray-300">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:text-gray-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Header & Quick Action Hub */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold uppercase tracking-wider">
            <span>MODUL ADMINISTRASI DATA SPASIAL</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Kelola Data Arsip Kejadian
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Katalog induk validasi dan audit peristiwa hidrometeorologi &amp; geologis 2018–2024 ({formatAngka(summary?.total)} arsip terstandardisasi) terintegrasi sistem Tim Pemantau Wilayah seluruh Indonesia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white hover:bg-primary-container text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Baru</span>
          </button>

          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg transition-colors border border-surface-container cursor-pointer"
          >
            <Upload className="w-4 h-4 text-secondary" />
            <span>Impor CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-container text-white hover:bg-primary text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Terfilter</span>
          </button>
        </div>
      </header>

      {/* Stat Cards Section (4 Key Aggregates) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Kejadian
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">dataset</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold text-on-surface">{formatAngka(summary?.total)}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
              Kejadian tercatat
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full w-full rounded-full"></div>
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant mt-1.5">Periode 2018 - 2024, 38 Provinsi</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Korban Jiwa &amp; Hilang
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">sentiment_very_dissatisfied</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold text-red-600">{formatAngka(summary ? summary.meninggal + summary.hilang : null)}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">
              Meninggal &amp; Hilang
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-500 h-full w-[45%] rounded-full"></div>
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant mt-1.5">Data kumulatif nasional</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Luka-Luka
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ffdbca] text-[#5a2500] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">personal_injury</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold text-[#5a2500]">{formatAngka(summary?.luka)}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ffdbca] text-[#763300] font-semibold">
              Jiwa terdampak fisik
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#7d3600] h-full w-[65%] rounded-full"></div>
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant mt-1.5">Korban luka ringan &amp; berat</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Bangunan Terdampak
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">home_work</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold text-secondary">{formatAngka(summary ? summary.rumahRusak + summary.rumahTerendam + summary.fasilitasRusak : null)}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-semibold">
              Unit infrastruktur
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary-container h-full w-[82%] rounded-full"></div>
          </div>
          <p className="font-body-sm text-[11px] text-on-surface-variant mt-1.5">Rumah rusak, terendam &amp; fasos</p>
        </div>
      </section>

      {/* 13 Disaster Carousel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container">
        <DisasterCarousel onSelectCategory={(cat) => setTypeFilter(cat)} selectedCategory={typeFilter} />
      </div>

      {/* Filter & Search Toolbar */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-outline absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kabupaten, Kota, Provinsi, Jenis Bencana / ID kejadian..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs pl-9 pr-4 py-2 rounded-lg border border-surface-container focus:outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface-container-low text-xs border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter jenis bencana"
            >
              <option value="">Jenis Bencana (13 Tipe)</option>
              {JENIS_BENCANA.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-surface-container-low text-xs border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter provinsi"
            >
              <option value="">Semua Provinsi (38)</option>
              {PROVINSI_38.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-surface-container-low text-xs border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter tahun"
            >
              <option value="">Rentang: 2018 - 2024</option>
              {TAHUN_LIST.map((t) => (
                <option key={t} value={t}>
                  Tahun {t}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('');
                setProvinceFilter('');
                setYearFilter('');
              }}
              className="p-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low rounded-lg transition-colors border border-surface-container cursor-pointer"
              title="Reset Parameter Filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-on-surface">Filter Aktif:</span>
            <span className="bg-surface-container px-2 py-0.5 rounded-full text-primary font-medium text-[11px]">
              {yearFilter ? `Tahun ${yearFilter}` : 'Arsip 2018 – 2024'}
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded-full text-secondary font-medium text-[11px]">
              {typeFilter ? `Jenis: ${typeFilter}` : 'Semua 13 Jenis Bencana'}
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium text-[11px]">
              {provinceFilter ? `Prov: ${provinceFilter}` : '38 Provinsi'}
            </span>
          </div>
          <span className="text-[11px]">
            Ditemukan <strong className="text-on-surface">{formatAngka(totalRows)}</strong> baris arsip
          </span>
        </div>
      </section>

      {/* Main Data Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider border-b border-surface-container">
                <th className="py-3 px-4">Tanggal &amp; Waktu</th>
                <th className="py-3 px-4">Jenis Bencana</th>
                <th className="py-3 px-4">Kabupaten / Kota</th>
                <th className="py-3 px-4">Provinsi</th>
                <th className="py-3 px-4">Ringkasan Dampak</th>
                <th className="py-3 px-4">Penyebab</th>
                <th className="py-3 px-4 text-center">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {rows.map((record) => {
                const isLongsor = record.jenis.toLowerCase().includes('longsor');
                return (
                  <tr key={record.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-on-surface">{record.tanggal}</div>
                      <div className="text-[11px] text-outline">{record.waktu || 'WIB'}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          isLongsor ? 'bg-[#ffdbca] text-[#763300]' : 'bg-[#cce5ff] text-[#00476e]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isLongsor ? 'bg-[#5a2500]' : 'bg-[#006398]'}`}></span>
                        {record.jenis}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-on-surface whitespace-nowrap">
                      {record.kabupatenKota}
                      <span className="block text-[10px] text-outline font-normal">{record.id}</span>
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                      {record.provinsi}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-on-surface">{record.ringkasanDampak}</div>
                      <div className="text-[11px] text-on-surface-variant truncate">{record.deskripsiDetail}</div>
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant max-w-[200px] truncate">
                      {record.penyebab}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(record)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary cursor-pointer transition-colors"
                          title="Edit Catatan Kejadian"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(record);
                            setDeleteAuthConfirmed(false);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer transition-colors"
                          title="Hapus Catatan Bencana"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!isLoading && rows.length === 0 && (
            <div className="py-10 text-center text-xs text-on-surface-variant">
              {errorMessage ? errorMessage : 'Tidak ada data kejadian yang cocok dengan filter yang dipilih.'}
            </div>
          )}
          {isLoading && rows.length === 0 && (
            <div className="py-10 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memuat data dari database...</span>
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-white border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              Menampilkan{' '}
              <strong className="text-on-surface">
                {totalRows === 0 ? '0' : `${formatAngka(startRow)} - ${formatAngka(endRow)}`}
              </strong>{' '}
              dari <strong className="text-on-surface">{formatAngka(totalRows)}</strong> baris kejadian
            </span>
          </div>
          <Pagination page={currentPageNum} totalPages={totalPages} onChange={setCurrentPageNum} disabled={isLoading} />
        </div>
      </section>

      {/* Modal Konfirmasi Hapus Data Kejadian */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-red-600"></div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[11px] text-red-600 uppercase tracking-wider font-bold">
                    Tindakan Destruktif Administratif
                  </span>
                  <h2 className="text-lg font-bold text-on-surface leading-snug">
                    Hapus Catatan Kejadian {deleteTarget.id}?
                  </h2>
                  <p className="text-xs text-on-surface-variant font-semibold">
                    {deleteTarget.jenis} - {deleteTarget.kabupatenKota}, {deleteTarget.provinsi}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl space-y-2 border border-surface-container text-left leading-relaxed">
                <p className="text-on-surface">
                  Tindakan ini akan menghapus permanen data kejadian {deleteTarget.kabupatenKota} (ID {deleteTarget.id}) dari database dan tidak dapat dibatalkan.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-on-surface-variant">
                  <Lock className="w-3.5 h-3.5 text-secondary" />
                  <span>Aksi ini hanya dapat dilakukan oleh akun <strong>Administrator</strong></span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-surface hover:bg-surface-container-low cursor-pointer transition-colors text-left">
                <input
                  type="checkbox"
                  checked={deleteAuthConfirmed}
                  onChange={(e) => setDeleteAuthConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs text-on-surface leading-relaxed">
                  Saya memahami konsekuensi penghapusan ini terhadap rekapitulasi data agregat kebencanaan nasional dan laporan infografis berkala.
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  disabled={!deleteAuthConfirmed || isDeleting}
                  onClick={confirmDelete}
                  className={`px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    !deleteAuthConfirmed || isDeleting ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Data */}
      {editModalOpen && form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-primary w-full"></div>
            <div className="p-5 flex items-center justify-between border-b border-surface-container">
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  {form.id ? 'Edit Catatan Kejadian Bencana' : 'Tambah Data Kejadian Baru'}
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  {form.id ? `ID: ${form.id}` : 'Data akan langsung disimpan ke database'}
                </p>
              </div>
              <button onClick={closeEditModal} type="button" className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Jenis Bencana</label>
                  <select required value={form.jenis} onChange={(e) => setField('jenis', e.target.value)} className={`${inputCls} cursor-pointer`}>
                    {JENIS_BENCANA.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tanggal Kejadian</label>
                  <input
                    type="date"
                    required
                    value={form.tanggalIso}
                    onChange={(e) => setField('tanggalIso', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Provinsi</label>
                  <select required value={form.provinsi} onChange={(e) => setField('provinsi', e.target.value)} className={`${inputCls} cursor-pointer`}>
                    <option value="">Pilih provinsi...</option>
                    {PROVINSI_38.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    list="saran-kabupaten-kota"
                    value={form.kabupatenKota}
                    onChange={(e) => setField('kabupatenKota', e.target.value)}
                    placeholder={form.provinsi ? 'Ketik atau pilih dari saran' : 'Pilih provinsi dulu'}
                    className={inputCls}
                  />
                  <datalist id="saran-kabupaten-kota">
                    {citySuggestions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <span className="font-semibold block mb-1">Dampak</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(
                    [
                      ['korbanMeninggal', 'Meninggal (jiwa)'],
                      ['korbanHilang', 'Hilang (jiwa)'],
                      ['korbanLuka', 'Luka-luka (jiwa)'],
                      ['rumahRusak', 'Rumah rusak'],
                      ['rumahTerendam', 'Rumah terendam'],
                      ['fasilitasRusak', 'Fasilitas rusak'],
                    ] as [keyof DisasterForm, string][]
                  ).map(([field, label]) => (
                    <div key={field}>
                      <label className="text-[11px] text-on-surface-variant block mb-1">{label}</label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={form[field] as string}
                        onChange={(e) => setField(field, e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Penyebab <span className="font-normal text-outline">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.penyebab}
                  onChange={(e) => setField('penyebab', e.target.value)}
                  placeholder="Kosongkan jika tidak diketahui"
                  className={inputCls}
                />
              </div>

              <div className="pt-2 border-t border-surface-container flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-container flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Menyimpan...' : form.id ? 'Simpan Perubahan' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Impor CSV Wizard */}
      {importModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setImportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-container p-6 space-y-4 text-xs text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-secondary" />
                <h3 className="text-base font-bold text-on-surface">Unggah Berkas CSV Bencana</h3>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-on-surface-variant leading-relaxed">
              Format file harus mengikuti template resmi Otoritas PantauBencana (.CSV) dengan kolom WGS84 latitude, longitude, dan tanggal kejadian.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-2 bg-surface-container-low">
              <span className="material-symbols-outlined text-4xl text-secondary">cloud_upload</span>
              <p className="font-semibold text-on-surface">Tarik &amp; lepas file CSV di sini</p>
              <p className="text-[11px] text-outline">atau klik tombol pilih file lokal</p>
              <input
                type="file"
                accept=".csv"
                onChange={() => {
                  setImportModalOpen(false);
                  showToast('File CSV berhasil diunggah! 125 baris tervalidasi dan ditambahkan ke antrean sinkronisasi.');
                }}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-container cursor-pointer mt-2"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
