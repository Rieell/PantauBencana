export type PageId =
  | 'dashboard'
  | 'beranda'
  | 'peta-bencana'
  | 'data-kejadian'
  | 'login'
  | 'register'
  | 'dashboard-admin'
  | 'kelola-data-admin'
  | 'kelola-pengguna-admin';

export type DisasterCategory =
  | 'Banjir'
  | 'Tanah Longsor'
  | 'Cuaca Ekstrem'
  | 'Kebakaran Hutan dan Lahan'
  | 'Puting Beliung'
  | 'Kekeringan'
  | 'Gempa Bumi'
  | 'Gelombang Pasang / Abrasi'
  | 'Erupsi Gunung Api'
  | 'Tsunami'
  | 'Gempa Bumi dan Tsunami'
  | 'Gelombang Pasang dan Abrasi'
  | 'Letusan Gunung Api';

export interface DisasterRecord {
  id: string;
  tanggal: string; // e.g. "17 Mar 2024"
  tanggalIso: string; // "2024-03-17"
  waktu?: string;
  jenis: DisasterCategory | string;
  kabupatenKota: string;
  provinsi: string;
  ringkasanDampak: string;
  penyebab: string;
  latitude: number;
  longitude: number;
  statusVerifikasi: 'Terverifikasi Otoritas PantauBencana' | 'Validasi Tim Pusat Penuh' | 'Menunggu Validasi Lapangan' | string;
  korbanMeninggal?: number;
  korbanLuka?: number;
  korbanHilang?: number;
  rumahRusak?: number;
  tingkatRisiko?: 'Tinggi' | 'Sedang' | 'Rendah';
  deskripsiDetail?: string;
}

export interface UserAccount {
  id: string;
  nama: string;
  email: string;
  peran: 'Admin' | 'User';
  tanggalRegister: string;
  instansi?: string;
  avatarColor?: string;
  status?: 'Aktif' | 'Ditangguhkan';
}

export interface DisasterStat {
  name: string;
  count: string;
  numericCount: number;
  pct: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  textBadge: string;
}

export interface CsvImportLog {
  id: string;
  namaFile: string;
  barisSukses: number;
  barisGagal: number;
  ukuran: string;
  diimporOleh: string;
  wilayah: string;
  waktu: string;
  status: 'Sukses' | 'Sebagian Gagal' | 'Selesai';
}

export interface WeatherData {
  kota: string;
  waktu: string;
  suhu: string;
  kondisi: string;
  iconType: 'cloudy' | 'sunny' | 'rain' | 'overcast';
}
