import { DisasterRecord, UserAccount } from '../types';

const TOKEN_KEY = 'pantaubencana_token';
export const AUTH_EXPIRED_EVENT = 'pantaubencana:auth-expired';

// ---- Token sesi login ----
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = (token: string, remember: boolean) => {
  clearToken();
  try {
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    /* penyimpanan browser tidak tersedia */
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* abaikan */
  }
};

// ---- Pemanggil API ----
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend (npm run server) dan MySQL sudah berjalan.');
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* respons tanpa isi */
  }

  if (!res.ok) {
    // Sesi habis / token tidak berlaku lagi
    if (res.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new ApiError(res.status, data?.error || `Permintaan gagal (HTTP ${res.status})`);
  }
  return data as T;
}

export const pesanError = (err: unknown): string => (err instanceof Error ? err.message : 'Terjadi kesalahan.');

// ---- Tipe respons ----
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserPage extends Paginated<UserAccount> {
  counts: { semua: number; admin: number; user: number };
}

export interface DisasterSummary {
  total: number;
  meninggal: number;
  hilang: number;
  luka: number;
  rumahRusak: number;
  rumahTerendam: number;
  fasilitasRusak: number;
}

export interface DisasterFilters {
  q?: string;
  jenis?: string;
  provinsi?: string;
  tahun?: string;
}

export const buatQuery = (params: Record<string, string | number | undefined | null>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') sp.set(k, String(v));
  });
  return sp.toString();
};

export const fetchDisasters = (
  filters: DisasterFilters,
  page: number,
  pageSize: number,
  opts: { cariId?: boolean; signal?: AbortSignal } = {}
) =>
  api<Paginated<DisasterRecord>>(
    `/api/disasters?${buatQuery({ ...filters, page, pageSize, cariId: opts.cariId ? 1 : undefined })}`,
    { signal: opts.signal }
  );

export const urlEkspor = (filters: DisasterFilters, cariId = false) =>
  `/api/disasters/export?${buatQuery({ ...filters, cariId: cariId ? 1 : undefined })}`;

// Unduh berkas dari URL (dipakai untuk ekspor CSV)
export const unduh = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Bentuk yang dikirim ke server saat tambah / ubah kejadian
export interface DisasterPayload {
  jenis: string;
  tanggalIso: string;
  kabupatenKota: string;
  provinsi: string;
  penyebab: string;
  korbanMeninggal: number;
  korbanHilang: number;
  korbanLuka: number;
  rumahRusak: number;
  rumahTerendam: number;
  fasilitasRusak: number;
}

export const simpanDisaster = (payload: DisasterPayload, id?: string) =>
  api<DisasterRecord>(id ? `/api/disasters/${id}` : '/api/disasters', { method: id ? 'PUT' : 'POST', body: payload });

export const hapusDisaster = (id: string) => api<{ ok: true }>(`/api/disasters/${id}`, { method: 'DELETE' });
