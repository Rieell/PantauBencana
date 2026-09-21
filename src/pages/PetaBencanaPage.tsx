import React, { useState } from 'react';
import { PageId, DisasterRecord } from '../types';
import { INITIAL_DISASTERS } from '../data/mockData';
import { InteractiveLeafletMap } from '../components/InteractiveLeafletMap';
import { Map, Layers, Filter, Search, AlertCircle, Compass, Info, X, ChevronRight, Droplets, Mountain, Wind, FlameKindling, Shield } from 'lucide-react';

interface PetaBencanaPageProps {
  onNavigate: (page: PageId) => void;
  disasters?: DisasterRecord[];
}

export const PetaBencanaPage: React.FC<PetaBencanaPageProps> = ({ onNavigate, disasters }) => {
  const allDisasters = disasters || INITIAL_DISASTERS;
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterRecord | null>(allDisasters[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered disasters for map
  const filteredDisasters = allDisasters.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.kabupatenKota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jenis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'all' ||
      item.jenis.toLowerCase().includes(filterType.toLowerCase());

    const matchesRisk =
      filterRisk === 'all' || item.tingkatRisiko === filterRisk;

    return matchesSearch && matchesType && matchesRisk;
  });

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

        {/* Toolbar Filter */}
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

          {/* Filter Type */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Jenis Bencana</option>
              <option value="banjir">Banjir</option>
              <option value="longsor">Tanah Longsor</option>
              <option value="cuaca">Cuaca Ekstrem</option>
              <option value="pasang">Gelombang Pasang / Rob</option>
            </select>

            {/* Filter Risk */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-xs bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Tingkat Risiko</option>
              <option value="Tinggi">Risiko Tinggi</option>
              <option value="Sedang">Risiko Sedang</option>
              <option value="Rendah">Risiko Rendah</option>
            </select>
          </div>
        </div>

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
                  • {filteredDisasters.length} titik aktif terpantau
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
              onSelectDisaster={(disaster) => setSelectedDisaster(disaster)}
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
