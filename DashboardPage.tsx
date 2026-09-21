import React, { useState, useEffect, useRef } from 'react';
import { PageId, DisasterRecord } from '../types';
import { INITIAL_DISASTERS } from '../data/mockData';
import { 
  Map, 
  Table, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning,
  PhoneCall, 
  ShieldAlert, 
  Clock, 
  Wind, 
  Droplets,
  Calendar,
  Sparkles
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  disasters?: DisasterRecord[];
}

interface CityWeather {
  kota: string;
  provinsi: string;
  zonaWaktu: 'WIB' | 'WITA' | 'WIT';
  timeZone: string;
  // Saat Ini
  suhuSaatIni: string;
  kondisiSaatIni: string;
  iconSaatIni: 'sunny' | 'rain' | 'cloudy' | 'thunder';
  // Besok
  suhuBesok: string;
  kondisiBesok: string;
  iconBesok: 'sunny' | 'rain' | 'cloudy' | 'thunder';
  // Lusa
  suhuLusa: string;
  kondisiLusa: string;
  iconLusa: 'sunny' | 'rain' | 'cloudy' | 'thunder';
  kelembapan: string;
  angin: string;
}

const INDONESIA_CITIES_WEATHER: CityWeather[] = [
  {
    kota: 'Jakarta Pusat',
    provinsi: 'DKI Jakarta',
    zonaWaktu: 'WIB',
    timeZone: 'Asia/Jakarta',
    suhuSaatIni: '31°C',
    kondisiSaatIni: 'Cerah Berawan',
    iconSaatIni: 'sunny',
    suhuBesok: '30°C',
    kondisiBesok: 'Hujan Ringan',
    iconBesok: 'rain',
    suhuLusa: '29°C',
    kondisiLusa: 'Hujan Sedang',
    iconLusa: 'rain',
    kelembapan: '72%',
    angin: '14 km/jam'
  },
  {
    kota: 'Bandung',
    provinsi: 'Jawa Barat',
    zonaWaktu: 'WIB',
    timeZone: 'Asia/Jakarta',
    suhuSaatIni: '24°C',
    kondisiSaatIni: 'Hujan Ringan',
    iconSaatIni: 'rain',
    suhuBesok: '23°C',
    kondisiBesok: 'Hujan Petir',
    iconBesok: 'thunder',
    suhuLusa: '25°C',
    kondisiLusa: 'Berawan Tebal',
    iconLusa: 'cloudy',
    kelembapan: '88%',
    angin: '10 km/jam'
  },
  {
    kota: 'Semarang',
    provinsi: 'Jawa Tengah',
    zonaWaktu: 'WIB',
    timeZone: 'Asia/Jakarta',
    suhuSaatIni: '32°C',
    kondisiSaatIni: 'Berawan',
    iconSaatIni: 'cloudy',
    suhuBesok: '31°C',
    kondisiBesok: 'Cerah Berawan',
    iconBesok: 'sunny',
    suhuLusa: '30°C',
    kondisiLusa: 'Hujan Ringan',
    iconLusa: 'rain',
    kelembapan: '75%',
    angin: '18 km/jam'
  },
  {
    kota: 'Surabaya',
    provinsi: 'Jawa Timur',
    zonaWaktu: 'WIB',
    timeZone: 'Asia/Jakarta',
    suhuSaatIni: '33°C',
    kondisiSaatIni: 'Cerah Berawan',
    iconSaatIni: 'sunny',
    suhuBesok: '32°C',
    kondisiBesok: 'Cerah',
    iconBesok: 'sunny',
    suhuLusa: '31°C',
    kondisiLusa: 'Berawan',
    iconLusa: 'cloudy',
    kelembapan: '68%',
    angin: '20 km/jam'
  },
  {
    kota: 'Medan',
    provinsi: 'Sumatera Utara',
    zonaWaktu: 'WIB',
    timeZone: 'Asia/Jakarta',
    suhuSaatIni: '29°C',
    kondisiSaatIni: 'Hujan Petir',
    iconSaatIni: 'thunder',
    suhuBesok: '28°C',
    kondisiBesok: 'Hujan Lebat',
    iconBesok: 'rain',
    suhuLusa: '29°C',
    kondisiLusa: 'Hujan Ringan',
    iconLusa: 'rain',
    kelembapan: '84%',
    angin: '12 km/jam'
  },
  {
    kota: 'Palembang',
    provinsi: 'Sumatera Selatan',
    zonaWaktu: 'WIB',
    timeZone: 'Asia/Jakarta',
    suhuSaatIni: '31°C',
    kondisiSaatIni: 'Berawan',
    iconSaatIni: 'cloudy',
    suhuBesok: '30°C',
    kondisiBesok: 'Hujan Sedang',
    iconBesok: 'rain',
    suhuLusa: '31°C',
    kondisiLusa: 'Cerah Berawan',
    iconLusa: 'sunny',
    kelembapan: '78%',
    angin: '11 km/jam'
  },
  {
    kota: 'Denpasar',
    provinsi: 'Bali',
    zonaWaktu: 'WITA',
    timeZone: 'Asia/Makassar',
    suhuSaatIni: '30°C',
    kondisiSaatIni: 'Cerah Berawan',
    iconSaatIni: 'sunny',
    suhuBesok: '30°C',
    kondisiBesok: 'Cerah Berawan',
    iconBesok: 'sunny',
    suhuLusa: '29°C',
    kondisiLusa: 'Hujan Ringan',
    iconLusa: 'rain',
    kelembapan: '70%',
    angin: '16 km/jam'
  },
  {
    kota: 'Makassar',
    provinsi: 'Sulawesi Selatan',
    zonaWaktu: 'WITA',
    timeZone: 'Asia/Makassar',
    suhuSaatIni: '31°C',
    kondisiSaatIni: 'Hujan Ringan',
    iconSaatIni: 'rain',
    suhuBesok: '29°C',
    kondisiBesok: 'Hujan Petir',
    iconBesok: 'thunder',
    suhuLusa: '30°C',
    kondisiLusa: 'Berawan',
    iconLusa: 'cloudy',
    kelembapan: '82%',
    angin: '19 km/jam'
  },
  {
    kota: 'Balikpapan',
    provinsi: 'Kalimantan Timur',
    zonaWaktu: 'WITA',
    timeZone: 'Asia/Makassar',
    suhuSaatIni: '29°C',
    kondisiSaatIni: 'Berawan Tebal',
    iconSaatIni: 'cloudy',
    suhuBesok: '28°C',
    kondisiBesok: 'Hujan Ringan',
    iconBesok: 'rain',
    suhuLusa: '30°C',
    kondisiLusa: 'Cerah Berawan',
    iconLusa: 'sunny',
    kelembapan: '80%',
    angin: '13 km/jam'
  },
  {
    kota: 'Manado',
    provinsi: 'Sulawesi Utara',
    zonaWaktu: 'WITA',
    timeZone: 'Asia/Makassar',
    suhuSaatIni: '28°C',
    kondisiSaatIni: 'Hujan Petir',
    iconSaatIni: 'thunder',
    suhuBesok: '27°C',
    kondisiBesok: 'Hujan Sedang',
    iconBesok: 'rain',
    suhuLusa: '28°C',
    kondisiLusa: 'Berawan',
    iconLusa: 'cloudy',
    kelembapan: '86%',
    angin: '15 km/jam'
  },
  {
    kota: 'Mataram',
    provinsi: 'Nusa Tenggara Barat',
    zonaWaktu: 'WITA',
    timeZone: 'Asia/Makassar',
    suhuSaatIni: '31°C',
    kondisiSaatIni: 'Cerah',
    iconSaatIni: 'sunny',
    suhuBesok: '31°C',
    kondisiBesok: 'Cerah Berawan',
    iconBesok: 'sunny',
    suhuLusa: '30°C',
    kondisiLusa: 'Hujan Ringan',
    iconLusa: 'rain',
    kelembapan: '66%',
    angin: '14 km/jam'
  },
  {
    kota: 'Jayapura',
    provinsi: 'Papua',
    zonaWaktu: 'WIT',
    timeZone: 'Asia/Jayapura',
    suhuSaatIni: '28°C',
    kondisiSaatIni: 'Hujan Ringan',
    iconSaatIni: 'rain',
    suhuBesok: '27°C',
    kondisiBesok: 'Hujan Petir',
    iconBesok: 'thunder',
    suhuLusa: '28°C',
    kondisiLusa: 'Berawan Tebal',
    iconLusa: 'cloudy',
    kelembapan: '90%',
    angin: '10 km/jam'
  },
  {
    kota: 'Ambon',
    provinsi: 'Maluku',
    zonaWaktu: 'WIT',
    timeZone: 'Asia/Jayapura',
    suhuSaatIni: '27°C',
    kondisiSaatIni: 'Hujan Sedang',
    iconSaatIni: 'rain',
    suhuBesok: '28°C',
    kondisiBesok: 'Berawan',
    iconBesok: 'cloudy',
    suhuLusa: '29°C',
    kondisiLusa: 'Cerah Berawan',
    iconLusa: 'sunny',
    kelembapan: '85%',
    angin: '17 km/jam'
  },
  {
    kota: 'Sorong',
    provinsi: 'Papua Barat Daya',
    zonaWaktu: 'WIT',
    timeZone: 'Asia/Jayapura',
    suhuSaatIni: '29°C',
    kondisiSaatIni: 'Berawan',
    iconSaatIni: 'cloudy',
    suhuBesok: '28°C',
    kondisiBesok: 'Hujan Ringan',
    iconBesok: 'rain',
    suhuLusa: '27°C',
    kondisiLusa: 'Hujan Petir',
    iconLusa: 'thunder',
    kelembapan: '84%',
    angin: '12 km/jam'
  }
];

interface EarlyWarningItem {
  id: string;
  title: string;
  timeRange: string;
  desc: string;
  status: 'Waspada' | 'Siaga';
  wilayah: string;
}

const PRECISE_EARLY_WARNINGS: EarlyWarningItem[] = [
  {
    id: 'WARN-01',
    title: 'Peringatan Dini Cuaca Jawa Barat & Banten',
    timeRange: 'Pukul 14.15–17.00 WIB',
    desc: 'Berpotensi terjadi hujan lebat disertai kilat/petir dan angin kencang di wilayah Bogor, Sukabumi, Cianjur, Lebak, dan Pandeglang.',
    status: 'Siaga',
    wilayah: 'Jawa Bagian Barat'
  },
  {
    id: 'WARN-02',
    title: 'Peringatan Dini Cuaca Ekstrem Sulawesi Selatan',
    timeRange: 'Pukul 15.00–17.30 WITA',
    desc: 'Waspada curah hujan intensitas tinggi di wilayah Luwu Utara, Enrekang, Tana Toraja, dan Bone berpotensi memicu luapan debit sungai.',
    status: 'Siaga',
    wilayah: 'Sulawesi Selatan'
  },
  {
    id: 'WARN-03',
    title: 'Peringatan Gelombang Tinggi Laut Jawa & Pantura',
    timeRange: 'Pukul 16.00–21.00 WIB',
    desc: 'Tinggi gelombang laut mencapai 1.5–2.5 meter. Waspada potensi banjir rob di sepanjang pesisir Pekalongan, Demak, dan Semarang.',
    status: 'Waspada',
    wilayah: 'Pesisir Utara Jawa'
  },
  {
    id: 'WARN-04',
    title: 'Peringatan Dini Cuaca Wilayah Papua & Papua Barat',
    timeRange: 'Pukul 15.30–18.45 WIT',
    desc: 'Hujan lebat berdurasi lebih dari 2 jam di daerah lereng perbukitan Jayapura dan Sorong. Warga diimbau siaga longsor susulan.',
    status: 'Siaga',
    wilayah: 'Papua & Sekitarnya'
  },
  {
    id: 'WARN-05',
    title: 'Peringatan Angin Kencang Selat Bali & Selat Lombok',
    timeRange: 'Pukul 13.00–16.30 WITA',
    desc: 'Kecepatan angin berkisar 25–35 knot berpotensi mempengaruhi keselamatan rute penyeberangan feri antar pulau.',
    status: 'Waspada',
    wilayah: 'Kepulauan Nusa Tenggara'
  }
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, disasters }) => {
  const currentDisasters = disasters || INITIAL_DISASTERS;
  const [weatherDay, setWeatherDay] = useState<'today' | 'tomorrow' | 'after'>('today');
  
  // Real-time ticking clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Warning auto-slide state (every 5s, 0.65s smooth slide)
  const warningList = PRECISE_EARLY_WARNINGS;
  const numWarnings = warningList.length;
  const extendedWarnings = [...warningList, ...warningList, ...warningList];
  const [warningTrackIndex, setWarningTrackIndex] = useState(numWarnings);
  const [isWarningTransitioning, setIsWarningTransitioning] = useState(true);
  const [isWarningHovered, setIsWarningHovered] = useState(false);

  // City cards auto-slide infinite loop state (every 4s, 0.65s smooth slide 1 by 1)
  const cityList = INDONESIA_CITIES_WEATHER;
  const numCities = cityList.length;
  const extendedCities = [...cityList, ...cityList, ...cityList];
  const [cityTrackIndex, setCityTrackIndex] = useState(numCities);
  const [isCityTransitioning, setIsCityTransitioning] = useState(true);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  // 1. Live real-time clock timer (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Early warning auto-slider (5 seconds, 0.65s transition)
  useEffect(() => {
    if (isWarningHovered) return;
    const interval = setInterval(() => {
      setIsWarningTransitioning(true);
      setWarningTrackIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isWarningHovered]);

  const handleWarningTransitionEnd = () => {
    if (warningTrackIndex >= numWarnings * 2) {
      setIsWarningTransitioning(false);
      setWarningTrackIndex(warningTrackIndex - numWarnings);
    } else if (warningTrackIndex < numWarnings) {
      setIsWarningTransitioning(false);
      setWarningTrackIndex(warningTrackIndex + numWarnings);
    }
  };

  const handleNextWarning = () => {
    setIsWarningTransitioning(true);
    setWarningTrackIndex((prev) => prev + 1);
  };

  const handlePrevWarning = () => {
    setIsWarningTransitioning(true);
    setWarningTrackIndex((prev) => prev - 1);
  };

  // 3. City cards infinite slider (moves one-by-one automatically every 4 seconds, 0.65s transition)
  useEffect(() => {
    if (isSliderHovered) return;
    const interval = setInterval(() => {
      setIsCityTransitioning(true);
      setCityTrackIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isSliderHovered]);

  const handleCityTransitionEnd = () => {
    if (cityTrackIndex >= numCities * 2) {
      setIsCityTransitioning(false);
      setCityTrackIndex(cityTrackIndex - numCities);
    } else if (cityTrackIndex < numCities) {
      setIsCityTransitioning(false);
      setCityTrackIndex(cityTrackIndex + numCities);
    }
  };

  const handleNextCity = () => {
    setIsCityTransitioning(true);
    setCityTrackIndex((prev) => prev + 1);
  };

  const handlePrevCity = () => {
    setIsCityTransitioning(true);
    setCityTrackIndex((prev) => prev - 1);
  };

  // Helper to format live time per timezone
  const getCityLiveTime = (timeZone: string, zonaWaktu: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return `${formatter.format(currentTime)} ${zonaWaktu}`;
    } catch {
      return `${currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ${zonaWaktu}`;
    }
  };

  // Helper to get formatted date for Besok & Lusa
  const getForecastDateLabel = (dayOffset: number) => {
    const targetDate = new Date(currentTime.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    return targetDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  const renderWeatherIcon = (icon: 'sunny' | 'rain' | 'cloudy' | 'thunder', sizeClass = 'w-10 h-10') => {
    switch (icon) {
      case 'sunny':
        return <Sun className={`${sizeClass} text-amber-500 animate-pulse`} />;
      case 'rain':
        return <CloudRain className={`${sizeClass} text-blue-500`} />;
      case 'cloudy':
        return <Cloud className={`${sizeClass} text-slate-400`} />;
      case 'thunder':
        return <CloudLightning className={`${sizeClass} text-indigo-600 animate-bounce`} />;
      default:
        return <Cloud className={`${sizeClass} text-slate-400`} />;
    }
  };

  const recentIncidents = currentDisasters.slice(0, 9);

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8 pb-12">
        {/* 1. Hero Section */}
        <section className="relative bg-white rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm border border-surface-container overflow-hidden">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Pusat Data Historis &amp; Geospasial Bencana
            </div>

            <h1 className="font-display-lg text-3xl sm:text-4xl lg:text-5xl text-on-surface font-extrabold tracking-tight leading-tight">
              Pantau Informasi Historis <span className="text-primary">Banjir</span> dan <span className="text-tertiary">Longsor</span> di Indonesia
            </h1>

            <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-3xl leading-relaxed">
              Akses terbuka visualisasi spasial, statistik wilayah terdampak, dan rekam jejak bencana hidrometeorologi basah untuk riset, mitigasi daerah, dan kesiapsiagaan warga secara komprehensif.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('peta-bencana')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-title-md text-sm sm:text-base font-semibold rounded-xl shadow-md hover:bg-primary-container transition-all transform active:scale-95 cursor-pointer"
              >
                <Map className="w-5 h-5" />
                <span>Buka Peta Interaktif</span>
              </button>

              <button
                onClick={() => onNavigate('data-kejadian')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary border border-surface-container font-title-md text-sm sm:text-base font-semibold rounded-xl shadow-xs hover:bg-surface-container-low transition-all cursor-pointer"
              >
                <Table className="w-5 h-5" />
                <span>Eksplorasi Data Kejadian</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Cuaca Saat Ini (Real-Time Weather System) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                  Cuaca Saat Ini
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Realtime
                </span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
                Pemantauan Cuaca Simulasi Terintegrasi Realtime
              </p>
            </div>

            {/* Weather Day Tabs */}
            <div className="inline-flex items-center p-1 bg-surface-container rounded-xl gap-1 self-start sm:self-auto border border-surface-container shadow-xs">
              <button
                type="button"
                onClick={() => setWeatherDay('today')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  weatherDay === 'today' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Saat ini</span>
              </button>
              <button
                type="button"
                onClick={() => setWeatherDay('tomorrow')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  weatherDay === 'tomorrow' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Besok</span>
              </button>
              <button
                type="button"
                onClick={() => setWeatherDay('after')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  weatherDay === 'after' ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Lusa</span>
              </button>
            </div>
          </div>

          {/* Peringatan Dini Otomatis:
              - Rentang waktu presisi (misal: pukul 15.00-17.30 WITA)
              - Tampilan bersih tanpa angka indikator halaman
              - Bergeser otomatis setiap 5 detik dengan animasi transisi halus 0,65 detik
              - Tombol prev/next manual
          */}
          <div 
            onMouseEnter={() => setIsWarningHovered(true)}
            onMouseLeave={() => setIsWarningHovered(false)}
            className="w-full flex items-center justify-between rounded-xl p-3 sm:p-4 border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-[#fffdf9] to-amber-50/90 relative overflow-hidden shadow-xs"
          >
            <button
              type="button"
              aria-label="Peringatan sebelumnya"
              onClick={handlePrevWarning}
              className="w-8 h-8 rounded-lg text-amber-900 bg-amber-100/70 hover:bg-amber-200/70 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Warning Content with smooth 0.65s sliding track */}
            <div className="flex-1 overflow-hidden mx-2 sm:mx-4">
              <div
                onTransitionEnd={handleWarningTransitionEnd}
                className="flex"
                style={{
                  transform: `translateX(calc(-1 * ${warningTrackIndex} * 100%))`,
                  transition: isWarningTransitioning ? 'transform 650ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                }}
              >
                {extendedWarnings.map((warn, wIdx) => (
                  <div
                    key={`${warn.id}-${wIdx}`}
                    className="w-full flex-shrink-0 flex items-start sm:items-center gap-3.5 min-w-0"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    
                    <div className="space-y-0.5 text-left flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                          {warn.status}
                        </span>
                        <h3 className="font-title-md text-sm text-on-surface font-bold truncate">
                          {warn.title}
                        </h3>
                        <span className="text-outline hidden sm:inline">•</span>
                        <span className="text-xs font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {warn.timeRange}
                        </span>
                      </div>
                      
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed line-clamp-2 sm:line-clamp-1">
                        {warn.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Peringatan selanjutnya"
              onClick={handleNextWarning}
              className="w-8 h-8 rounded-lg text-amber-900 bg-amber-100/70 hover:bg-amber-200/70 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slider Kartu Kota:
              - 5 kartu kota dalam viewport
              - Bergerak satu per satu otomatis setiap 4 detik dengan animasi geser halus 0,65 detik
              - Siklus tanpa batas (infinite loop)
              - Tombol panah < dan > untuk menggeser secara manual
              - Tab Saat Ini: jam berjalan real-time + zona waktu
              - Tab Besok & Lusa: format jam otomatis berubah menjadi tanggal
          */}
          <div 
            className="relative select-none"
            onMouseEnter={() => setIsSliderHovered(true)}
            onMouseLeave={() => setIsSliderHovered(false)}
          >
            {/* Header Control Buttons for City Slider */}
            <div className="flex items-center justify-between pb-2">
              <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Geser ke kiri"
                  onClick={handlePrevCity}
                  className="w-8 h-8 rounded-lg bg-white border border-surface-container text-on-surface hover:bg-surface-container flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Geser ke kanan"
                  onClick={handleNextCity}
                  className="w-8 h-8 rounded-lg bg-white border border-surface-container text-on-surface hover:bg-surface-container flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5 City Cards Smooth Sliding Viewport */}
            <div className="relative w-full overflow-hidden py-1 rounded-xl">
              <div
                onTransitionEnd={handleCityTransitionEnd}
                className="flex"
                style={{
                  transform: `translateX(calc(-1 * ${cityTrackIndex} * (100% / 5)))`,
                  transition: isCityTransitioning ? 'transform 650ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                }}
              >
                {extendedCities.map((city, idx) => {
                  // Determine values based on active tab
                  let suhu = city.suhuSaatIni;
                  let kondisi = city.kondisiSaatIni;
                  let icon = city.iconSaatIni;
                  let dateOrTimeSubtext = getCityLiveTime(city.timeZone, city.zonaWaktu);

                  if (weatherDay === 'tomorrow') {
                    suhu = city.suhuBesok;
                    kondisi = city.kondisiBesok;
                    icon = city.iconBesok;
                    dateOrTimeSubtext = getForecastDateLabel(1);
                  } else if (weatherDay === 'after') {
                    suhu = city.suhuLusa;
                    kondisi = city.kondisiLusa;
                    icon = city.iconLusa;
                    dateOrTimeSubtext = getForecastDateLabel(2);
                  }

                  return (
                    <div
                      key={`${city.kota}-${idx}`}
                      className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 flex-shrink-0 px-1.5"
                    >
                      <div className="relative bg-white rounded-2xl p-4 flex flex-col justify-between border border-surface-container shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 group h-full">
                        {/* Top Row: City & Timezone Badge */}
                        <div className="flex items-start justify-between gap-1 pb-2 border-b border-surface-container/60">
                          <div className="text-left">
                            <h4 className="font-title-lg text-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                              {city.kota}
                            </h4>
                            <span className="text-[10px] text-on-surface-variant line-clamp-1">
                              {city.provinsi}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-primary shrink-0">
                            {city.zonaWaktu}
                          </span>
                        </div>

                        {/* Time or Date Indicator */}
                        <div className="pt-2 text-left">
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary bg-surface-container-low px-2 py-0.5 rounded-md border border-surface-container/50">
                            {weatherDay === 'today' ? (
                              <>
                                <Clock className="w-3 h-3 text-secondary" />
                                <span className="font-mono tracking-tight font-semibold">{dateOrTimeSubtext}</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="w-3 h-3 text-secondary" />
                                <span>{dateOrTimeSubtext}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Weather Icon & Temperature */}
                        <div className="my-3 flex items-center justify-between px-1">
                          <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container/40">
                            {renderWeatherIcon(icon, 'w-9 h-9')}
                          </div>
                          <div className="text-right">
                            <span className="font-headline-lg text-2xl font-bold tracking-tight block text-on-surface">
                              {suhu}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant font-medium block">
                              {kondisi}
                            </span>
                          </div>
                        </div>

                        {/* Weather Details (Kelembapan & Angin) */}
                        <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
                          <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            <span>{city.kelembapan}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-teal-600" />
                            <span>{city.angin}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Catatan Kejadian Terbaru */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">history</span>
                <h2 className="font-headline-md text-xl sm:text-2xl text-on-surface font-bold">
                  Catatan Kejadian Terbaru
                </h2>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Catatan mutakhir yang telah diverifikasi dan masuk basis data Otoritas PantauBencana
              </p>
            </div>

            <button
              onClick={() => onNavigate('data-kejadian')}
              className="self-start sm:self-auto inline-flex items-center gap-1 px-4 py-2 bg-surface-container-low text-primary rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors cursor-pointer border border-surface-container"
            >
              <span>Lihat Semua 14.820 Data</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentIncidents.map((incident) => {
              const isLongsor = incident.jenis.toLowerCase().includes('longsor');
              return (
                <div
                  key={incident.id}
                  className="bg-white rounded-xl p-4 border border-surface-container flex flex-col justify-between shadow-xs hover:shadow-md transition-all group hover:border-primary/30"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                      <span className="font-title-md text-xs font-bold text-on-surface">
                        {incident.tanggal}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                          isLongsor
                            ? 'bg-[#ffdbca] text-[#763300]'
                            : 'bg-[#cce5ff] text-[#00476e]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLongsor ? 'bg-[#5a2500]' : 'bg-[#006398]'
                          }`}
                        ></span>
                        {incident.jenis}
                      </span>
                    </div>

                    <div className="pt-1">
                      <h3 className="font-headline-md text-base text-on-surface font-bold leading-tight group-hover:text-primary transition-colors">
                        {incident.kabupatenKota}
                      </h3>
                      <span className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                        {incident.provinsi}
                      </span>
                    </div>

                    <div className="bg-surface-container-low rounded-lg p-2.5 space-y-0.5 mt-2 border border-surface-container">
                      <div className="font-bold text-xs text-on-surface">{incident.ringkasanDampak}</div>
                      <div className="font-body-sm text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                        {incident.deskripsiDetail}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-3 border-t border-surface-container flex items-start gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-outline shrink-0 mt-0.5">info</span>
                    <span className="leading-tight text-[11px]">Penyebab: {incident.penyebab}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Callout Edukatif & Kontak Darurat */}
        <section className="bg-surface-container-low rounded-2xl p-6 sm:p-8 shadow-xs border border-surface-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-title-md text-base text-on-surface font-bold">
                  Batasan Layanan &amp; Jalur Kontak Tanggap Bantuan
                </h4>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Catatan: <strong className="text-on-surface">PantauBencana</strong> tidak menyediakan sensor ketinggian air langsung atau alarm sirine fisik di lapangan. Sistem ini difungsikan khusus sebagai pusat data arsip evaluasi spasial dan pemantauan terintegrasi. Untuk keadaan darurat aktif di lapangan, segera hubungi tim pertolongan dan posko siaga terdekat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-white px-5 py-3 rounded-xl shadow-xs border border-surface-container">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                  Call Center Bantuan
                </span>
                <span className="font-headline-md text-base sm:text-lg font-extrabold text-red-600 leading-none">
                  0800-000-0000
                </span>
                <span className="text-[9px] text-on-surface-variant font-medium mt-0.5">
                  Bebas Pulsa 24 Jam
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
