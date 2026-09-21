import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

// Daftar nomor halaman dengan "..." di antara halaman yang jauh, mis. 1 ... 4 5 6 ... 2878
const nomorHalaman = (page: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const hasil: (number | '...')[] = [1];
  const awal = Math.max(2, page - 1);
  const akhir = Math.min(total - 1, page + 1);
  if (awal > 2) hasil.push('...');
  for (let i = awal; i <= akhir; i++) hasil.push(i);
  if (akhir < total - 1) hasil.push('...');
  hasil.push(total);
  return hasil;
};

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange, disabled }) => {
  const susah = 'disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        className={`px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer ${susah}`}
      >
        Sebelumnya
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {nomorHalaman(page, totalPages).map((n, i) =>
          n === '...' ? (
            <span key={`titik-${i}`} className="px-1 text-outline">
              ...
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              disabled={disabled}
              aria-current={n === page ? 'page' : undefined}
              className={`min-w-8 h-8 px-2 rounded-lg font-bold cursor-pointer ${susah} ${
                n === page ? 'bg-primary text-white' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              {n.toLocaleString('id-ID')}
            </button>
          )
        )}
      </div>
      <span className="sm:hidden px-2 text-on-surface-variant">
        {page} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className={`px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer ${susah}`}
      >
        Selanjutnya
      </button>
    </nav>
  );
};
