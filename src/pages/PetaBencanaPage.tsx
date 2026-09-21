import React, { useEffect, useMemo, useState } from 'react';
import { PageId, DisasterRecord } from '../types';
import { InteractiveLeafletMap } from '../components/InteractiveLeafletMap';
import { JENIS_BENCANA, PROVINSI_38, TAHUN_LIST } from '../data/constants';
import { fetchDisasters, pesanError } from '../lib/api';
import { useDebounced } from '../lib/hooks';
import { Search, AlertCircle, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';

interface PetaBencanaPageProps {
  onNavigate: (page: PageId) => void;
}

// Jumlah maksimum titik yang digambar di peta supaya peta tetap lancar
const MAKS_TITIK_PETA = 1000;

export const PetaBencanaPage: React.FC<PetaBencanaPageProps> = ({ onNavigate }) => {
  const [mapData, setMapData] = useState<DisasterRecord[]>([]);
  const [totalCocok, setTotalCocok] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterRecord | null>(null);

  const [filterType, setFilterType] = useState<string>('');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounced(searchQuery);

  // Ambil titik kejadian dari database setiap kali filter berubah
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage('');
    fetchDisasters(
      { q: debouncedSearch, jenis: filterType, provinsi: filterProvince, tahun: filterYear },
      1,
      MAKS_TITIK_PETA,
      { signal: controller.signal }
    )
      .then((res) => {
        setMapData(res.data);
        setTotalCocok(res.total);
        setSelectedDisaster(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return;
        setErrorMessage(pesanError(err));
        setMapData([]);
        setTotalCocok(0);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [debouncedSearch, filterType, filterProvince, filterYear]);

  // Filter tingkat risiko dihitung di browser (tingkat risiko diturunkan dari dampak)
  const filteredDisasters = useMemo(
    () => (filterRisk === 'all' ? mapData : mapData.filter((item) => item.tingkatRisiko === filterRisk)),
    [mapData, filterRisk]
  );

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterProvince('');
    setFilterYear('');
    setFilterRisk('all');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 space-y-6">
        {/* Top Header Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              Sistem Informasi Spasial Bencana Indonesia
            </div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold tracking-tight">
              Peta Geospasial Sebaran Bencana
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
              Visualisasi titik koordinat historis bencana banjir, tanah longsor, dan hidrometeorologi nasional berbasis verifikasi Otoritas PantauBencana.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onNavigate('data-kejadian')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold rounded-lg transition-colors border border-surface-container cursor-pointer"
            >
              <span>Buka Tabel Data Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Panel */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-container flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-outline absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kabupaten, provinsi, atau tipe bencana..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low text-xs rounded-lg border border-surface-container focus:outline-none focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Jenis Bencana (13 jenis) */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter jenis bencana"
            >
              <option value="">Semua Jenis Bencana</option>
              {JENIS_BENCANA.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            {/* Filter Provinsi (38 provinsi) */}
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="text-xs bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter provinsi"
            >
              <option value="">Semua Provinsi</option>
              {PROVINSI_38.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Filter Tahun (2018 - 2024) */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="text-xs bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter tahun"
            >
              <option value="">Semua Tahun (2018-2024)</option>
              {TAHUN_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Filter Risk */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
              aria-label="Filter tingkat risiko"
            >
              <option value="all">Semua Tingkat Risiko</option>
              <option value="Tinggi">Risiko Tinggi</option>
              <option value="Sedang">Risiko Sedang</option>
              <option value="Rendah">Risiko Rendah</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="p-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low rounded-lg transition-colors border border-surface-container cursor-pointer"
              title="Reset filter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Interactive Map & Details Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map Stage */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 shadow-sm border border-surface-container flex flex-col relative">
            {/* Map Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-xs font-bold text-on-surface">
                  Peta Spasial Geospasial Indonesia (OpenStreetMap &amp; Topografi)
                </span>
                <span className="text-[11px] text-on-surface-variant hidden sm:inline">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-1">
                      • <Loader2 className="w-3 h-3 animate-spin" /> memuat data...
                    </span>
                  ) : totalCocok > MAKS_TITIK_PETA ? (
                    `• menampilkan ${filteredDisasters.length.toLocaleString('id-ID')} kejadian terbaru dari ${totalCocok.toLocaleString('id-ID')} (persempit dengan filter)`
                  ) : (
                    `• ${filteredDisasters.length.toLocaleString('id-ID')} titik kejadian terpantau`
                  )}
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant font-medium hidden sm:block">
                Sistem Koordinat WGS84
              </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <InteractiveLeafletMap
              disasters={filteredDisasters}
              selectedDisaster={selectedDisaster}
              onSelectDisaster={setSelectedDisaster}
              mapHeightClass="min-h-[600px] h-[640px]"
            />
          </div>

          {/* Right Sidebar: Selected Incident Details & Hotspot List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Selected Hotspot Detail Card */}
            {selectedDisaster ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container space-y-3">
                <div className="flex items-center justify-between border-b border-surface-container pb-2">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Titik Terpilih di Peta
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container font-semibold text-on-surface-variant">
                    {selectedDisaster.statusVerifikasi}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase mb-1 ${
                      selectedDisaster.jenis.toLowerCase().includes('longsor')
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {selectedDisaster.jenis}
                  </span>
                  <h3 className="text-lg font-bold text-on-surface leading-tight">
                    {selectedDisaster.kabupatenKota}, {selectedDisaster.provinsi}
                  </h3>
                  <span className="text-xs text-on-surface-variant block mt-0.5">
                    Tanggal: <strong className="text-on-surface">{selectedDisaster.tanggal} ({selectedDisaster.waktu || 'WIB'})</strong>
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl border border-surface-container text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Korban Jiwa:</span>
                    <span className="font-bold text-red-600">{selectedDisaster.korbanMeninggal || 0} Meninggal</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Korban Luka:</span>
                    <span className="font-bold text-amber-700">{selectedDisaster.korbanLuka || 0} Jiwa</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-surface-container">
                    <span className="text-[10px] text-on-surface-variant block">Dampak Fisik:</span>
                    <span className="font-semibold text-on-surface">{selectedDisaster.ringkasanDampak}</span>
                  </div>
                </div>

                <div className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-0.5">Keterangan Verifikasi Lapangan:</strong>
                  {selectedDisaster.deskripsiDetail}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-outline">
                  <span>Lat: {selectedDisaster.latitude}</span>
                  <span>Lon: {selectedDisaster.longitude}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center border border-surface-container text-xs text-on-surface-variant">
                Klik salah satu titik pin di peta untuk melihat ringkasan detail kejadian.
              </div>
            )}

            {/* Quick List of Incident Hotspots */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-container flex-1 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="text-xs font-bold text-on-surface">Daftar Hotspot Kejadian ({filteredDisasters.length})</span>
                <span className="text-[10px] text-outline">Klik untuk pusatkan</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {filteredDisasters.map((item) => {
                  const isCurrent = selectedDisaster?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDisaster(item)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-surface-container-high border-primary font-semibold text-primary'
                          : 'bg-surface-container-low border-surface-container hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{item.kabupatenKota}</span>
                        <span className="text-[10px] opacity-75">{item.tanggal}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        {item.jenis} • {item.provinsi}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
