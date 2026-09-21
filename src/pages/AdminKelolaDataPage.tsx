import React, { useState } from 'react';
import { PageId, DisasterRecord } from '../types';
import { DisasterCarousel } from '../components/DisasterCarousel';
import { Search, Plus, Upload, Download, Trash2, Edit3, X, AlertTriangle, Lock, CheckCircle2, RotateCcw, Filter, Eye, Save } from 'lucide-react';

interface AdminKelolaDataPageProps {
  onNavigate: (page: PageId) => void;
  disasters: DisasterRecord[];
  onAddDisaster: (newRecord: DisasterRecord) => void;
  onUpdateDisaster: (updatedRecord: DisasterRecord) => void;
  onDeleteDisaster: (id: string) => void;
}

export const AdminKelolaDataPage: React.FC<AdminKelolaDataPageProps> = ({
  onNavigate,
  disasters,
  onAddDisaster,
  onUpdateDisaster,
  onDeleteDisaster,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DisasterRecord | null>(null);
  const [deleteAuthConfirmed, setDeleteAuthConfirmed] = useState(false);

  // Edit / Add modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DisasterRecord | null>(null);

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

  // Filtered
  const filteredData = disasters.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.kabupatenKota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.penyebab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ringkasanDampak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !typeFilter || item.jenis.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesProvince = !provinceFilter || item.provinsi.toLowerCase().includes(provinceFilter.toLowerCase());
    const matchesYear = !yearFilter || item.tanggalIso.startsWith(yearFilter);

    return matchesSearch && matchesType && matchesProvince && matchesYear;
  });

  const confirmDelete = () => {
    if (!deleteTarget || !deleteAuthConfirmed) return;
    onDeleteDisaster(deleteTarget.id);
    showToast(`Catatan kejadian ${deleteTarget.id} (${deleteTarget.kabupatenKota}) berhasil dihapus dari database.`);
    setDeleteTarget(null);
    setDeleteAuthConfirmed(false);
  };

  const handleOpenEdit = (record: DisasterRecord) => {
    setEditingRecord({ ...record });
    setEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingRecord({
      id: `BNC-${Date.now().toString().slice(-6)}`,
      tanggal: '20 Jun 2024',
      tanggalIso: '2024-06-20',
      waktu: '10:00 WIB',
      jenis: 'Banjir',
      kabupatenKota: '',
      provinsi: 'Jawa Tengah',
      ringkasanDampak: '',
      penyebab: '',
      latitude: -6.9,
      longitude: 110.4,
      statusVerifikasi: 'Terverifikasi Otoritas PantauBencana',
      korbanMeninggal: 0,
      korbanLuka: 0,
      tingkatRisiko: 'Sedang',
      deskripsiDetail: '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const exists = disasters.some((d) => d.id === editingRecord.id);
    if (exists) {
      onUpdateDisaster(editingRecord);
      showToast(`Catatan kejadian ${editingRecord.id} berhasil diperbarui.`);
    } else {
      onAddDisaster(editingRecord);
      showToast(`Catatan kejadian ${editingRecord.id} baru berhasil ditambahkan.`);
    }
    setEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Tanggal', 'Jenis', 'Kabupaten/Kota', 'Provinsi', 'Ringkasan Dampak', 'Penyebab'];
    const rows = filteredData.map((d) => [
      d.id,
      `"${d.tanggal}"`,
      `"${d.jenis}"`,
      `"${d.kabupatenKota}"`,
      `"${d.provinsi}"`,
      `"${d.ringkasanDampak.replace(/"/g, '""')}"`,
      `"${d.penyebab.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pantau_bencana_admin_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Katalog induk validasi dan audit peristiwa hidrometeorologi &amp; geologis 2018–2024 (28.773 arsip terstandardisasi) terintegrasi sistem Tim Pemantau Wilayah seluruh Indonesia.
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
            <span className="font-display-lg text-2xl font-bold text-on-surface">{disasters.length + 28760}</span>
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
            <span className="font-display-lg text-2xl font-bold text-red-600">4.829</span>
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
            <span className="font-display-lg text-2xl font-bold text-[#5a2500]">18.240</span>
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
            <span className="font-display-lg text-2xl font-bold text-secondary">342.180</span>
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
              placeholder="Cari Kabupaten, Kota, Provinsi, Penyebab / ID kejadian..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs pl-9 pr-4 py-2 rounded-lg border border-surface-container focus:outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface-container-low text-xs border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="">Jenis Bencana (13 Tipe)</option>
              <option value="banjir">Banjir</option>
              <option value="cuaca">Cuaca Ekstrem</option>
              <option value="longsor">Tanah Longsor</option>
              <option value="karhutla">Kebakaran Hutan &amp; Lahan</option>
              <option value="puting">Puting Beliung</option>
              <option value="kekeringan">Kekeringan</option>
              <option value="gempa">Gempa Bumi</option>
              <option value="pasang">Gelombang Pasang / Abrasi</option>
              <option value="erupsi">Erupsi Gunung Api</option>
              <option value="tsunami">Tsunami</option>
            </select>

            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-surface-container-low text-xs border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="">Provinsi: Normalisasi 40 Ragam</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Timur">Jawa Timur</option>
              <option value="Sulawesi Selatan">Sulawesi Selatan</option>
              <option value="Sumatera Barat">Sumatera Barat</option>
              <option value="Jambi">Jambi</option>
              <option value="Papua">Papua</option>
              <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-surface-container-low text-xs border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="">Rentang: 2018 - 2024</option>
              <option value="2024">Tahun 2024 (Berjalan)</option>
              <option value="2023">Tahun 2023</option>
              <option value="2022">Tahun 2022</option>
              <option value="2021">Tahun 2021</option>
              <option value="2020">Tahun 2020</option>
              <option value="2019">Tahun 2019</option>
              <option value="2018">Tahun 2018</option>
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
              Arsip 1 Jan 2018 – 2024
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded-full text-secondary font-medium text-[11px]">
              {typeFilter ? `Jenis: ${typeFilter}` : 'Semua 13 Jenis Bencana'}
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-medium text-[11px]">
              {provinceFilter ? `Prov: ${provinceFilter}` : '38 Provinsi'}
            </span>
          </div>
          <span className="text-[11px]">
            Menampilkan <strong className="text-on-surface">{filteredData.length}</strong> baris arsip
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
              {filteredData.map((record) => {
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
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-white border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div>
            Menampilkan 1 - {filteredData.length} dari 28.773 baris kejadian terverifikasi
          </div>
          <div className="flex items-center gap-1">
            <button disabled className="px-3 py-1.5 rounded-lg bg-surface-container-low opacity-50 cursor-not-allowed">
              Sebelumnya
            </button>
            <button className="w-7 h-7 rounded bg-primary text-white font-bold">1</button>
            <button className="w-7 h-7 rounded bg-surface-container-low hover:bg-surface-container text-on-surface">2</button>
            <button className="w-7 h-7 rounded bg-surface-container-low hover:bg-surface-container text-on-surface">3</button>
            <span className="px-1">...</span>
            <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface">
              Selanjutnya
            </button>
          </div>
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
                  Tindakan ini akan menghapus data {deleteTarget.kabupatenKota} dari katalog tampilan publik dan memindahkannya ke arsip audit log. Aksi ini memerlukan persetujuan otorisasi operator.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-on-surface-variant">
                  <Lock className="w-3.5 h-3.5 text-secondary" />
                  <span>Sesi diverifikasi oleh: <strong>Tim Administrator Pusat Analis</strong></span>
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
                  disabled={!deleteAuthConfirmed}
                  onClick={confirmDelete}
                  className={`px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    !deleteAuthConfirmed ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Data */}
      {editModalOpen && editingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-surface-container flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-primary w-full"></div>
            <div className="p-5 flex items-center justify-between border-b border-surface-container">
              <div>
                <h3 className="font-bold text-base text-on-surface">
                  {disasters.some((d) => d.id === editingRecord.id) ? 'Edit Catatan Kejadian Bencana' : 'Input Catatan Baru'}
                </h3>
                <p className="text-[11px] text-on-surface-variant">ID: {editingRecord.id}</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Jenis Bencana</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.jenis}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jenis: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Tanggal</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.tanggal}
                    onChange={(e) => setEditingRecord({ ...editingRecord, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.kabupatenKota}
                    onChange={(e) => setEditingRecord({ ...editingRecord, kabupatenKota: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.provinsi}
                    onChange={(e) => setEditingRecord({ ...editingRecord, provinsi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Ringkasan Dampak</label>
                <input
                  type="text"
                  required
                  value={editingRecord.ringkasanDampak}
                  onChange={(e) => setEditingRecord({ ...editingRecord, ringkasanDampak: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Penyebab</label>
                <input
                  type="text"
                  required
                  value={editingRecord.penyebab}
                  onChange={(e) => setEditingRecord({ ...editingRecord, penyebab: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Keterangan Verifikasi Detail</label>
                <textarea
                  rows={3}
                  value={editingRecord.deskripsiDetail || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, deskripsiDetail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container text-xs"
                />
              </div>

              <div className="pt-2 border-t border-surface-container flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-container flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
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
