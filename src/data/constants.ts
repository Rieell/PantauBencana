// Pilihan filter & form yang dipakai di banyak halaman

// 13 jenis bencana (sesuai data di database)
export const JENIS_BENCANA: string[] = [
  'Banjir',
  'Cuaca ekstrem',
  'Tanah longsor',
  'Kebakaran hutan dan lahan',
  'Puting beliung',
  'Kekeringan',
  'Gempa bumi',
  'Gelombang pasang / abrasi',
  'Erupsi gunung api',
  'Tsunami',
  'Gempa bumi dan tsunami',
  'Gelombang pasang dan abrasi',
  'Letusan gunung api',
];

// 38 provinsi
export const PROVINSI_38: string[] = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'DI Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Tengah',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
];

// Tahun data: 2018 - 2024 (terbaru di atas)
export const TAHUN_LIST: string[] = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export const PAGE_SIZE = 10;

// Cocokkan teks dari server (mis. "Cuaca Ekstrem") ke pilihan di daftar tanpa peduli huruf besar/kecil
export const cocokkanPilihan = (daftar: string[], nilai: string): string =>
  daftar.find((x) => x.toLowerCase() === nilai.trim().toLowerCase()) || '';
