import { useEffect, useState } from 'react';
import { api, DisasterSummary } from './api';

// Menunda nilai (mis. teks pencarian) supaya server tidak dipanggil di setiap ketikan
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Angka ringkasan nasional dari database (kartu statistik)
export function useSummary(refreshKey: unknown = 0) {
  const [summary, setSummary] = useState<DisasterSummary | null>(null);
  useEffect(() => {
    let batal = false;
    api<DisasterSummary>('/api/summary')
      .then((s) => !batal && setSummary(s))
      .catch(() => !batal && setSummary(null));
    return () => {
      batal = true;
    };
  }, [refreshKey]);
  return summary;
}

export const formatAngka = (n?: number | null) => (n === undefined || n === null ? '—' : n.toLocaleString('id-ID'));
