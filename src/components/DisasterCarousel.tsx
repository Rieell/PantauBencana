import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_DISASTER_STATS } from '../data/mockData';
import { DisasterStat } from '../types';
import { api } from '../lib/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Wind, 
  Mountain, 
  Flame, 
  Sun, 
  Waves, 
  FlameKindling, 
  Activity 
} from 'lucide-react';

interface DisasterCarouselProps {
  onSelectCategory?: (categoryName: string) => void;
  selectedCategory?: string;
}

export const DisasterCarousel: React.FC<DisasterCarouselProps> = ({ onSelectCategory, selectedCategory }) => {
  // Angka per jenis diambil dari database; kalau backend belum jalan tetap memakai angka bawaan
  const [items, setItems] = useState<DisasterStat[]>(INITIAL_DISASTER_STATS);
  useEffect(() => {
    let batal = false;
    api<{ jenis: string; total: number }[]>('/api/stats')
      .then((rows) => {
        if (batal) return;
        const perJenis = new Map(rows.map((r) => [r.jenis.toLowerCase(), r.total]));
        const total = rows.reduce((a, r) => a + r.total, 0) || 1;
        setItems(
          INITIAL_DISASTER_STATS.map((it) => {
            const n = perJenis.get(it.name.toLowerCase()) ?? 0;
            const p = (n / total) * 100;
            return { ...it, numericCount: n, count: n.toLocaleString('id-ID'), pct: p >= 1 ? `${p.toFixed(1)}%` : `${p.toFixed(2)}%` };
          })
        );
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, []);

  const n = items.length; // 13 items
  // Extended array for seamless sliding
  const extendedItems = [...items, ...items, ...items];
  const startIndex = n; // start at middle copy

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const transitionDuration = 650; // 0.65 detik
  const autoSlideInterval = 4000; // 4 detik
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto slide 1 by 1 every 4 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, autoSlideInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // Check boundary reset after 0.65s transition completes
  const handleTransitionEnd = () => {
    if (currentIndex >= n * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - n);
    } else if (currentIndex < n) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + n);
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'water_drop':
      case 'water':
        return <Droplets className={className} />;
      case 'cyclone':
      case 'air':
        return <Wind className={className} />;
      case 'landscape':
      case 'landslide':
        return <Mountain className={className} />;
      case 'local_fire_department':
        return <Flame className={className} />;
      case 'sunny':
        return <Sun className={className} />;
      case 'broken_image':
        return <Activity className={className} />;
      case 'tsunami':
      case 'waves':
      case 'flood':
        return <Waves className={className} />;
      case 'volcano':
        return <FlameKindling className={className} />;
      default:
        return <Droplets className={className} />;
    }
  };

  // Card width calculation:
  // On desktop (lg): 5 cards per view => 20%
  // On tablet (md): 3 cards per view => 33.333%
  // On mobile: 1.5 cards per view => 66.666% or 1 card => 100%
  // We use responsive CSS variables / transform percentages based on card item width

  return (
    <div 
      className="pt-space-xs border-t border-surface-container flex flex-col gap-space-sm w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">category</span>
          </div>
          <div>
            <h3 className="font-title-md text-sm sm:text-base text-on-surface font-bold">
              Distribusi 13 Jenis Bencana
            </h3>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">
              Statistik terpilah kejadian bencana nasional (Otomatis bergeser setiap 4 detik)
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-[10px] font-bold uppercase ml-1">
            13 Kategori
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Geser 1 ke kiri"
            title="Geser sebelumnya"
            className="w-8 h-8 rounded-full bg-white hover:bg-surface-container text-on-surface flex items-center justify-center transition-all border border-surface-container shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-on-surface" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Geser 1 ke kanan"
            title="Geser selanjutnya"
            className="w-8 h-8 rounded-full bg-white hover:bg-surface-container text-on-surface flex items-center justify-center transition-all border border-surface-container shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-4 h-4 text-on-surface" />
          </button>
        </div>
      </div>

      {/* Outer Viewport */}
      <div className="relative w-full overflow-hidden py-1 rounded-xl">
        {/* Track */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex"
          style={{
            transform: `translateX(calc(-1 * ${currentIndex} * (100% / 5)))`,
            transition: isTransitioning
              ? `transform ${transitionDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
              : 'none',
          }}
        >
          {extendedItems.map((item, idx) => {
            const isSelected = selectedCategory === item.name;
            return (
              <div
                key={`${item.name}-${idx}`}
                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 flex-shrink-0 px-1.5"
              >
                <div
                  onClick={() => onSelectCategory && onSelectCategory(isSelected ? '' : item.name)}
                  className={`h-full bg-white rounded-xl p-3 border transition-all duration-200 select-none group cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-fixed/20 shadow-sm'
                      : 'border-surface-container hover:border-primary/40 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span 
                      className="font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider truncate max-w-[120px]" 
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <div className={`w-6 h-6 rounded-md ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      {renderIcon(item.icon, `w-3.5 h-3.5 ${item.color}`)}
                    </div>
                  </div>

                  <div>
                    <div className="font-headline-md text-lg sm:text-xl font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                      {item.count}
                    </div>
                    <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-surface-container font-label-sm text-[10px]">
                      <span className="text-on-surface-variant">{item.pct} total</span>
                      <span className="font-semibold text-primary group-hover:underline">
                        {isSelected ? 'Dipilih' : 'Filter'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
