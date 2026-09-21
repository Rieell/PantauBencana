import React, { useEffect, useState } from 'react';
import { PageId, DisasterRecord } from '../types';
import { DisasterCarousel } from '../components/DisasterCarousel';
import { Pagination } from '../components/Pagination';
import { JENIS_BENCANA, PROVINSI_38, TAHUN_LIST, PAGE_SIZE } from '../data/constants';
import { fetchDisasters, pesanError, unduh, urlEkspor } from '../lib/api';
import { formatAngka, useDebounced, useSummary } from '../lib/hooks';
import { Search, RotateCcw, Download, Eye, X, Printer, CheckCircle, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';

interface DataKejadianPageProps {
  onNavigate: (page: PageId) => void;
}

export const DataKejadianPage: React.FC<DataKejadianPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [emptySimActive, setEmptySimActive] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<DisasterRecord | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);

  const [rows, setRows] = useState<DisasterRecord[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const summary = useSummary();
  const debouncedSearch = useDebounced(searchQuery);
  const filters = { q: debouncedSearch, jenis: typeFilter, provinsi: provinceFilter, tahun: yearFilter };

  // Pindah ke halaman 1 setiap kali filter berubah
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
      { signal: controller.signal }
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
  }, [debouncedSearch, typeFilter, provinceFilter, yearFilter, currentPageNum]);

  const displayedRows = emptySimActive ? [] : rows;
  const startRow = totalRows === 0 ? 0 : (currentPageNum - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPageNum * PAGE_SIZE, totalRows);

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setProvinceFilter('');
    setYearFilter('');
    setEmptySimActive(false);
    setCurrentPageNum(1);
  };

  // Ekspor CSV semua hasil filter (bukan hanya halaman yang tampil)
  const handleDownloadCsv = () => unduh(urlEkspor(filters));

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* 1. Header Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full mb-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wider font-bold">
                Repositori Resmi Terverifikasi
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary tracking-tight font-bold">
              Data Kejadian Bencana
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Katalog lengkap data arsip kejadian banjir dan tanah longsor di Indonesia yang telah terverifikasi oleh Tim Administrator Pusat Otoritas PantauBencana (Periode 2018 - 2024).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onNavigate('peta-bencana')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-xs cursor-pointer"
            >
              <span>Buka Tampilan Peta</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Ringkasan Angka Kejadian Nasional (4 Cards) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container space-y-4">
          <div className="border-b border-surface-container pb-2">
            <h2 className="font-title-lg text-base text-on-surface font-bold">
              Ringkasan Angka Kejadian Nasional
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block">
                    Total Kejadian
                  </span>
                  <div className="font-headline-lg text-2xl font-bold text-primary mt-1">{formatAngka(summary?.total)}</div>
                  <p className="font-body-sm text-xs text-on-surface-variant">Kejadian tercatat</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                </div>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                <span>Periode 2018 - 2024</span>
                <span className="font-semibold text-primary">38 Provinsi</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block">
                    Korban Jiwa &amp; Hilang
                  </span>
                  <div className="font-headline-lg text-2xl font-bold text-red-600 mt-1">{formatAngka(summary ? summary.meninggal + summary.hilang : null)}</div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded bg-red-100 text-red-800 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    <span>Meninggal &amp; Hilang</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">person_remove</span>
                </div>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1 text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Data kumulatif nasional</span>
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block">
                    Luka-Luka
                  </span>
                  <div className="font-headline-lg text-2xl font-bold text-[#5a2500] mt-1">{formatAngka(summary?.luka)}</div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded bg-[#ffdbca] text-[#763300] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5a2500]"></span>
                    <span>Jiwa terdampak fisik</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#ffdbca] text-[#5a2500] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">personal_injury</span>
                </div>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                <span>Korban luka ringan &amp; berat</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-surface-container">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block">
                    Bangunan Terdampak
                  </span>
                  <div className="font-headline-lg text-2xl font-bold text-secondary mt-1">{formatAngka(summary ? summary.rumahRusak + summary.rumahTerendam + summary.fasilitasRusak : null)}</div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded bg-secondary-fixed text-secondary text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>Unit infrastruktur</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">home_work</span>
                </div>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                <span>Rumah rusak, terendam &amp; fasos</span>
              </div>
            </div>
          </div>

          {/* Carousel 13 Jenis Bencana */}
          <DisasterCarousel
            onSelectCategory={(cat) => {
              setTypeFilter(cat);
            }}
            selectedCategory={typeFilter}
          />
        </div>

        {/* 3. Filter & Toolbar Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-4 relative flex items-center">
              <Search className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lokasi, kecamatan, atau kabupaten..."
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-xs font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-white border border-surface-container transition-colors"
              />
            </div>

            {/* Disaster Type Filter (13 jenis) */}
            <div className="lg:col-span-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container cursor-pointer"
                aria-label="Filter jenis bencana"
              >
                <option value="">Semua Jenis Bencana</option>
                {JENIS_BENCANA.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Filter (38 provinsi) */}
            <div className="lg:col-span-2">
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container cursor-pointer"
                aria-label="Filter provinsi"
              >
                <option value="">Semua Provinsi</option>
                {PROVINSI_38.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter (2018 - 2024) */}
            <div className="lg:col-span-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none border border-surface-container cursor-pointer"
                aria-label="Filter tahun"
              >
                <option value="">Semua Tahun (2018-2024)</option>
                {TAHUN_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div className="lg:col-span-2 flex items-center">
              <button
                onClick={resetFilters}
                className="w-full px-3 py-2 bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-surface-container cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Action Utilities & Data Counter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-container">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="text-xs text-on-surface">
                Menampilkan{' '}
                <span className="font-bold text-primary">
                  {emptySimActive || totalRows === 0 ? '0' : `${formatAngka(startRow)} - ${formatAngka(endRow)}`}
                </span>{' '}
                dari <span className="font-bold text-on-surface">{emptySimActive ? '0' : formatAngka(totalRows)}</span> Data Kejadian Terverifikasi
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadCsv}
                className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container text-primary font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-surface-container cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV / Terbuka</span>
              </button>

              <button
                onClick={() => setEmptySimActive(!emptySimActive)}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors border cursor-pointer ${
                  emptySimActive
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-surface-container'
                }`}
                title="Simulasikan tampilan jika data kosong"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{emptySimActive ? 'Matikan Simulasi' : 'Simulasi Data Kosong'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Table or Empty State */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isLoading && rows.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-surface-container flex items-center justify-center gap-2 text-xs text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memuat data kejadian dari database...</span>
          </div>
        ) : displayedRows.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-surface-container flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full my-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-3">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="font-headline-md text-lg text-on-surface font-bold mb-1">
              Data Tidak Ditemukan
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant max-w-md mb-4 leading-relaxed">
              Tidak ada kejadian bencana yang cocok dengan kata kunci atau filter yang Anda tentukan. Coba ubah rentang tanggal, filter jenis bencana, atau pilihan wilayah administratif.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bersihkan Filter Pencarian</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Historical Data Table */
          <div className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-semibold uppercase tracking-wider border-b border-surface-container">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Jenis Bencana</th>
                    <th className="py-3 px-4">Kabupaten / Kota</th>
                    <th className="py-3 px-4">Provinsi</th>
                    <th className="py-3 px-4">Ringkasan Dampak</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {displayedRows.map((incident) => {
                    const isLongsor = incident.jenis.toLowerCase().includes('longsor');
                    return (
                      <tr
                        key={incident.id}
                        className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <td className="py-3.5 px-4 font-bold text-on-surface whitespace-nowrap">
                          {incident.tanggal}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                              isLongsor ? 'bg-[#ffdbca] text-[#763300]' : 'bg-[#cce5ff] text-[#00476e]'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isLongsor ? 'bg-[#5a2500]' : 'bg-[#006398]'}`}></span>
                            {incident.jenis}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-on-surface whitespace-nowrap">
                          {incident.kabupatenKota}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                          {incident.provinsi}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-on-surface">{incident.ringkasanDampak}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(incident);
                            }}
                            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-[11px] cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 bg-white border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-on-surface-variant flex items-center gap-2">
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  Halaman <span className="font-bold text-on-surface">{formatAngka(currentPageNum)}</span> dari{' '}
                  <span className="font-bold text-on-surface">{formatAngka(totalPages)}</span>
                </span>
              </div>
              <Pagination page={currentPageNum} totalPages={totalPages} onChange={setCurrentPageNum} disabled={isLoading} />
            </div>
          </div>
        )}

        {/* 5. 3 Bento Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col justify-between space-y-3">
            <div>
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-lg">rule</span>
              </div>
              <h4 className="font-title-md text-sm text-on-surface font-bold mb-1">Standar Verifikasi 3 Lapis</h4>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Setiap baris data melewati validasi Tim Pemantau Wilayah, rekonsiliasi citra satelit spasial, serta konfirmasi akhir Tim Administrator Pusat Otoritas PantauBencana.
              </p>
            </div>
            <div className="pt-2 font-label-sm text-[11px] text-secondary flex items-center gap-1 font-semibold">
              <span>Protokol ISO 22301</span>
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col justify-between space-y-3">
            <div>
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined text-lg">dataset</span>
              </div>
              <h4 className="font-title-md text-sm text-on-surface font-bold mb-1">Akses Terbuka &amp; Bebas Lisensi</h4>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Dataset dipublikasikan di bawah Lisensi Terbuka Pemerintah Indonesia guna memfasilitasi riset universitas, tata ruang, dan jurnalisme data.
              </p>
            </div>
            <div className="pt-2 font-label-sm text-[11px] text-secondary flex items-center gap-1 font-semibold">
              <span>Format CSV, GeoJSON &amp; API REST</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col justify-between space-y-3">
            <div>
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-tertiary mb-2">
                <span className="material-symbols-outlined text-lg">update</span>
              </div>
              <h4 className="font-title-md text-sm text-on-surface font-bold mb-1">Siklus Pemutakhiran Rutin</h4>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Pembaruan berkala dilakukan setiap akhir bulan untuk menutup siklus laporan akhir dampak pascabencana (rehabilitasi &amp; rekonstruksi).
              </p>
            </div>
            <div className="pt-2 font-label-sm text-[11px] text-on-surface-variant flex items-center gap-1">
              <span>Sinkronisasi Terakhir: 30 Juni 2024</span>
            </div>
          </div>
        </div>

        {/* 6. Incident Detail Modal */}
        {selectedIncident && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setSelectedIncident(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col border border-surface-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`h-1.5 w-full ${
                  selectedIncident.jenis.toLowerCase().includes('longsor') ? 'bg-tertiary' : 'bg-primary'
                }`}
              ></div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${
                        selectedIncident.jenis.toLowerCase().includes('longsor')
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {selectedIncident.jenis}
                    </span>
                    <h3 className="text-xl font-bold text-on-surface">
                      Detail Kejadian {selectedIncident.kabupatenKota}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Terverifikasi Otoritas PantauBencana • {selectedIncident.tanggal} ({selectedIncident.waktu || 'WIB'})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-surface-container-low rounded-xl p-3.5 space-y-1 border border-surface-container">
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Lokasi Terdampak
                  </div>
                  <div className="text-sm font-bold text-on-surface">
                    Kab/Kota {selectedIncident.kabupatenKota}
                  </div>
                  <div className="text-xs text-secondary font-medium">
                    Provinsi {selectedIncident.provinsi}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Dampak Bencana
                  </div>
                  <p className="font-semibold text-on-surface">{selectedIncident.ringkasanDampak}</p>
                  <p className="text-on-surface-variant leading-relaxed">
                    {selectedIncident.deskripsiDetail}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-lg text-xs">
                  <div>
                    <span className="text-outline text-[11px] block">Penyebab:</span>
                    <span className="font-semibold">{selectedIncident.penyebab}</span>
                  </div>
                  <div>
                    <span className="text-outline text-[11px] block">Koordinat:</span>
                    <span className="font-mono text-[11px]">{selectedIncident.latitude}, {selectedIncident.longitude}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      alert('Mencetak lembar rekap data kejadian...');
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar Kejadian</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
