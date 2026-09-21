// Backend PantauBencana: Express + MySQL (database `pantaubencana` di phpMyAdmin)
// Jalankan: npm run server
import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json({ limit: '1mb' }));

// ---------- Koneksi database ----------
const DB_NAME = process.env.DB_NAME || 'pantaubencana';
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Kunci penanda sesi login. Isi JWT_SECRET di .env supaya sesi tidak hilang saat server restart.
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('[PERINGATAN] JWT_SECRET belum diisi di .env, memakai kunci acak sementara (semua sesi login hilang saat server restart).');
}

// ---------- Konstanta ----------
const JENIS_BENCANA = [
  'BANJIR', 'CUACA EKSTREM', 'TANAH LONGSOR', 'KEBAKARAN HUTAN DAN LAHAN', 'PUTING BELIUNG',
  'KEKERINGAN', 'GEMPA BUMI', 'GELOMBANG PASANG / ABRASI', 'ERUPSI GUNUNG API', 'TSUNAMI',
  'GEMPA BUMI DAN TSUNAMI', 'GELOMBANG PASANG DAN ABRASI', 'LETUSAN GUNUNG API',
];

const PROVINSI = [
  'ACEH', 'BALI', 'BANTEN', 'BENGKULU', 'DI YOGYAKARTA', 'DKI JAKARTA', 'GORONTALO', 'JAMBI',
  'JAWA BARAT', 'JAWA TENGAH', 'JAWA TIMUR', 'KALIMANTAN BARAT', 'KALIMANTAN SELATAN',
  'KALIMANTAN TENGAH', 'KALIMANTAN TIMUR', 'KALIMANTAN UTARA', 'KEPULAUAN BANGKA BELITUNG',
  'KEPULAUAN RIAU', 'LAMPUNG', 'MALUKU', 'MALUKU UTARA', 'NUSA TENGGARA BARAT', 'NUSA TENGGARA TIMUR',
  'PAPUA', 'PAPUA BARAT', 'PAPUA BARAT DAYA', 'PAPUA PEGUNUNGAN', 'PAPUA SELATAN', 'PAPUA TENGAH',
  'RIAU', 'SULAWESI BARAT', 'SULAWESI SELATAN', 'SULAWESI TENGAH', 'SULAWESI TENGGARA',
  'SULAWESI UTARA', 'SUMATERA BARAT', 'SUMATERA SELATAN', 'SUMATERA UTARA',
];

// Di tabel data_bencana ada penulisan provinsi yang berbeda-beda untuk provinsi yang sama.
// Saat memfilter, semua variasinya ikut dihitung.
const VARIAN_PROVINSI = {
  'DI YOGYAKARTA': ['DI YOGYAKARTA', 'DAERAH ISTIMEWA YOGYAKARTA'],
  'PAPUA': ['PAPUA', 'P A P U A'],
};
const varianProvinsi = (p) => VARIAN_PROVINSI[p] || [p];

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const KECIL = new Set(['dan', 'di', 'atau']);
const SINGKATAN = new Set(['DKI', 'DI']);

const titleCase = (s = '') =>
  s
    .toLowerCase()
    .split(' ')
    .map((w, i) =>
      SINGKATAN.has(w.toUpperCase()) ? w.toUpperCase() : KECIL.has(w) && i > 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ');

const normalisasiProvinsi = (p = '') => {
  const x = p.trim().toUpperCase().replace(/\s+/g, ' ');
  if (x === 'P A P U A') return 'PAPUA';
  if (x === 'DAERAH ISTIMEWA YOGYAKARTA') return 'DI YOGYAKARTA';
  return x;
};

// ---------- Koordinat ----------
// Tabel data_bencana tidak punya kolom latitude/longitude. Titik diambil dari tabel `wilayah`
// (koordinat kabupaten/kota, dicocokkan lewat city_id = kode). Kalau kota tidak ada di `wilayah`,
// dipakai titik tengah provinsi. Ada pergeseran kecil berdasarkan id supaya marker di kota yang
// sama tidak menumpuk persis di satu titik.
const PUSAT_PROVINSI = {
  'ACEH': [4.7, 96.8], 'SUMATERA UTARA': [2.1, 99.5], 'SUMATERA BARAT': [-0.9, 100.4],
  'RIAU': [0.5, 101.5], 'JAMBI': [-1.6, 103.6], 'SUMATERA SELATAN': [-3.3, 104.0],
  'BENGKULU': [-3.8, 102.3], 'LAMPUNG': [-4.9, 105.0], 'KEPULAUAN BANGKA BELITUNG': [-2.7, 106.5],
  'KEPULAUAN RIAU': [3.9, 108.1], 'DKI JAKARTA': [-6.2, 106.85], 'JAWA BARAT': [-6.9, 107.6],
  'BANTEN': [-6.4, 106.1], 'JAWA TENGAH': [-7.2, 110.2], 'DI YOGYAKARTA': [-7.9, 110.4],
  'JAWA TIMUR': [-7.7, 112.5], 'BALI': [-8.4, 115.2], 'NUSA TENGGARA BARAT': [-8.6, 117.4],
  'NUSA TENGGARA TIMUR': [-9.9, 122.0], 'KALIMANTAN BARAT': [-0.1, 110.9],
  'KALIMANTAN TENGAH': [-1.7, 113.4], 'KALIMANTAN SELATAN': [-3.1, 115.3],
  'KALIMANTAN TIMUR': [0.5, 116.4], 'KALIMANTAN UTARA': [3.1, 116.0],
  'SULAWESI UTARA': [1.0, 124.5], 'GORONTALO': [0.7, 122.4], 'SULAWESI TENGAH': [-1.4, 121.4],
  'SULAWESI BARAT': [-2.5, 119.3], 'SULAWESI SELATAN': [-3.7, 120.0],
  'SULAWESI TENGGARA': [-4.1, 122.1], 'MALUKU UTARA': [1.6, 127.8], 'MALUKU': [-3.2, 129.5],
  'PAPUA BARAT': [-1.3, 133.2], 'PAPUA BARAT DAYA': [-1.0, 131.5], 'PAPUA': [-3.5, 138.5],
  'PAPUA TENGAH': [-3.8, 136.5], 'PAPUA PEGUNUNGAN': [-4.1, 138.9], 'PAPUA SELATAN': [-7.5, 139.5],
};
const PUSAT_INDONESIA = [-2.5, 118.0];

const pseudoAcak = (seed, a, b) => ((seed * a + b) % 233280) / 233280; // deterministik 0..1

const koordinat = (r, provinsi) => {
  const jitterSeed = Number(r.id) || 0;
  if (r.lat != null && r.lng != null) {
    return [
      Number((r.lat + (pseudoAcak(jitterSeed, 9301, 49297) - 0.5) * 0.06).toFixed(4)),
      Number((r.lng + (pseudoAcak(jitterSeed, 7919, 12345) - 0.5) * 0.06).toFixed(4)),
    ];
  }
  const [lat, lng] = PUSAT_PROVINSI[provinsi] || PUSAT_INDONESIA;
  const cityId = Number(r.city_id) || jitterSeed;
  return [
    Number((lat + (pseudoAcak(cityId, 9301, 49297) - 0.5) * 0.8).toFixed(4)),
    Number((lng + (pseudoAcak(cityId, 7919, 12345) - 0.5) * 0.8).toFixed(4)),
  ];
};

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

// ---------- Konversi baris DB -> bentuk DisasterRecord di frontend ----------
const keRecord = (r) => {
  const d = new Date(r.date_str + 'T00:00:00');
  const meninggal = Math.round(r.death || 0);
  const hilang = Math.round(r.missing_person || 0);
  const luka = Math.round(r.injured_person || 0);
  const rusak = Math.round(r.damaged_house || 0);
  const terendam = Math.round(r.flooded_house || 0);
  const fasilitas = Math.round(r.damaged_facility || 0);
  const provinsi = normalisasiProvinsi(r.province);
  const [latitude, longitude] = koordinat(r, provinsi);

  const dampak = [
    meninggal && `${fmt(meninggal)} meninggal`,
    hilang && `${fmt(hilang)} hilang`,
    luka && `${fmt(luka)} luka`,
    rusak && `${fmt(rusak)} rumah rusak`,
    terendam && `${fmt(terendam)} rumah terendam`,
    fasilitas && `${fmt(fasilitas)} fasilitas rusak`,
  ].filter(Boolean);

  // Tingkat risiko diturunkan sederhana dari dampak (bukan kolom di database)
  const tingkatRisiko =
    meninggal > 0 || hilang > 0 || rusak + terendam >= 500 ? 'Tinggi' : luka > 0 || rusak + terendam >= 20 ? 'Sedang' : 'Rendah';

  return {
    id: String(r.id),
    tanggal: `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`,
    tanggalIso: r.date_str,
    jenis: titleCase(r.disaster_type),
    kabupatenKota: titleCase(r.city),
    provinsi: titleCase(provinsi),
    ringkasanDampak: dampak.length ? dampak.join(' · ') : 'Belum ada dampak tercatat',
    penyebab: r.cause,
    latitude,
    longitude,
    statusVerifikasi: 'Data Historis',
    korbanMeninggal: meninggal,
    korbanLuka: luka,
    korbanHilang: hilang,
    rumahRusak: rusak,
    rumahTerendam: terendam,
    fasilitasRusak: fasilitas,
    tingkatRisiko,
    deskripsiDetail: r.cause,
  };
};

const keUser = (u) => ({
  id: String(u.id),
  nama: u.name,
  email: u.email,
  peran: u.role === 'admin' ? 'Admin' : 'User',
  tanggalRegister: new Date(u.created_at).toISOString(),
  status: 'Aktif',
});

// ---------- Utilitas ----------
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const angka = (v, label) => {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100000000) throw new HttpError(400, `${label} harus berupa angka 0 atau lebih.`);
  return Math.round(n);
};

// Filter daftar kejadian (dipakai oleh daftar, ekspor CSV, dan peta)
function bangunFilterKejadian(query, { denganId = false } = {}) {
  const where = [];
  const params = [];

  if (query.jenis) {
    where.push('d.disaster_type = ?');
    params.push(String(query.jenis).trim().toUpperCase());
  }
  if (query.provinsi) {
    const varian = varianProvinsi(String(query.provinsi).trim().toUpperCase());
    where.push('d.province IN (?)');
    params.push(varian);
  }
  if (query.tahun) {
    const tahun = parseInt(query.tahun, 10);
    if (Number.isInteger(tahun) && tahun >= 1900 && tahun <= 2200) {
      where.push('d.`date` >= ? AND d.`date` < ?');
      params.push(`${tahun}-01-01`, `${tahun + 1}-01-01`);
    }
  }
  if (query.q) {
    const q = String(query.q).trim();
    if (q) {
      const like = `%${q}%`;
      const kondisi = ['d.city LIKE ?', 'd.province LIKE ?', 'd.disaster_type LIKE ?'];
      const p = [like, like, like];
      if (denganId && /^\d+$/.test(q)) {
        kondisi.push('d.id = ?');
        p.push(Number(q));
      }
      where.push(`(${kondisi.join(' OR ')})`);
      params.push(...p);
    }
  }
  return { whereSql: where.length ? 'WHERE ' + where.join(' AND ') : '', params };
}

const KOLOM_KEJADIAN = `d.*, DATE_FORMAT(d.\`date\`, '%Y-%m-%d') AS date_str, w.lat AS lat, w.lng AS lng`;
const DARI_KEJADIAN = 'FROM data_bencana d LEFT JOIN wilayah w ON w.kode = d.city_id';

async function ambilKejadianById(id) {
  const [rows] = await pool.query(`SELECT ${KOLOM_KEJADIAN} ${DARI_KEJADIAN} WHERE d.id = ?`, [id]);
  return rows[0] ? keRecord(rows[0]) : null;
}

// Cari city_id (kode wilayah) dari nama kabupaten/kota supaya baris baru konsisten dengan data lama
async function cariCityId(city, province) {
  let [rows] = await pool.query('SELECT city_id FROM data_bencana WHERE city = ? AND province IN (?) LIMIT 1', [
    city,
    varianProvinsi(province),
  ]);
  if (rows.length) return rows[0].city_id;
  [rows] = await pool.query('SELECT kode FROM wilayah WHERE UPPER(nama) IN (?, ?, ?) LIMIT 1', [
    city,
    `KABUPATEN ${city}`,
    `KOTA ${city}`,
  ]);
  return rows.length ? rows[0].kode : 0;
}

// Validasi body untuk tambah/ubah kejadian
async function bacaBodyKejadian(body = {}) {
  const jenis = String(body.jenis || '').trim().toUpperCase();
  if (!JENIS_BENCANA.includes(jenis)) throw new HttpError(400, 'Jenis bencana tidak valid.');

  const provinsi = normalisasiProvinsi(String(body.provinsi || ''));
  if (!PROVINSI.includes(provinsi)) throw new HttpError(400, 'Provinsi tidak valid.');

  const city = String(body.kabupatenKota || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (!city) throw new HttpError(400, 'Kabupaten / Kota wajib diisi.');
  if (city.length > 50) throw new HttpError(400, 'Nama Kabupaten / Kota maksimal 50 karakter.');

  const tanggal = String(body.tanggalIso || '').trim();
  const cek = new Date(tanggal + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(cek.getTime()) || cek.toISOString().slice(0, 10) !== tanggal) {
    throw new HttpError(400, 'Tanggal kejadian tidak valid.');
  }

  return {
    jenis,
    provinsi,
    city,
    tanggal,
    cause: String(body.penyebab || '').trim() || 'Tidak diketahui',
    death: angka(body.korbanMeninggal, 'Korban meninggal'),
    missing: angka(body.korbanHilang, 'Korban hilang'),
    injured: angka(body.korbanLuka, 'Korban luka'),
    damagedHouse: angka(body.rumahRusak, 'Rumah rusak'),
    floodedHouse: angka(body.rumahTerendam, 'Rumah terendam'),
    damagedFacility: angka(body.fasilitasRusak, 'Fasilitas rusak'),
  };
}

// ---------- Autentikasi ----------
const buatToken = (user, panjang = '7d') => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: panjang });

const wajibLogin = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Silakan login terlebih dahulu.'));
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, 'Sesi login berakhir. Silakan login kembali.'));
  }
};

// Peran dicek ulang ke database supaya akun yang dihapus / diturunkan hak aksesnya langsung kehilangan akses
const wajibAdmin = [
  wajibLogin,
  wrap(async (req, _res, next) => {
    const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [req.auth.id]);
    if (!rows.length) throw new HttpError(401, 'Akun tidak ditemukan. Silakan login kembali.');
    if (rows[0].role !== 'admin') throw new HttpError(403, 'Hanya administrator yang boleh melakukan aksi ini.');
    next();
  }),
];

async function buatUser({ nama, email, password, role }) {
  nama = String(nama || '').trim();
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  if (!nama) throw new HttpError(400, 'Nama lengkap wajib diisi.');
  if (nama.length > 100) throw new HttpError(400, 'Nama maksimal 100 karakter.');
  if (!EMAIL_RE.test(email) || email.length > 190) throw new HttpError(400, 'Format email tidak valid.');
  if (password.length < MIN_PASSWORD) throw new HttpError(400, `Kata sandi minimal ${MIN_PASSWORD} karakter.`);

  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      nama,
      email,
      hash,
      role,
    ]);
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.insertId]);
    return rows[0];
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Email tersebut sudah terdaftar.');
    throw err;
  }
}

app.post(
  '/api/auth/login',
  wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) throw new HttpError(400, 'Email dan kata sandi wajib diisi.');

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    const cocok = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!user || !cocok) throw new HttpError(401, 'Email atau kata sandi salah.');

    res.json({ token: buatToken(user, req.body?.remember ? '7d' : '12h'), user: keUser(user) });
  })
);

app.post(
  '/api/auth/register',
  wrap(async (req, res) => {
    // Pendaftaran publik selalu berperan 'user'
    const user = await buatUser({ ...req.body, role: 'user' });
    res.status(201).json({ user: keUser(user) });
  })
);

app.get(
  '/api/auth/me',
  wajibLogin,
  wrap(async (req, res) => {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.auth.id]);
    if (!rows.length) throw new HttpError(401, 'Akun tidak ditemukan.');
    res.json({ user: keUser(rows[0]) });
  })
);

// ---------- Endpoint publik ----------
app.get(
  '/api/health',
  wrap(async (_req, res) => {
    const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM data_bencana');
    res.json({ ok: true, database: DB_NAME, total: row.total });
  })
);

// GET /api/disasters?page=1&pageSize=10&jenis=Banjir&provinsi=Bali&tahun=2024&q=kata
app.get(
  '/api/disasters',
  wrap(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(2000, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const { whereSql, params } = bangunFilterKejadian(req.query, { denganId: req.query.cariId === '1' });

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM data_bencana d ${whereSql}`, params);
    const [rows] = await pool.query(
      `SELECT ${KOLOM_KEJADIAN} ${DARI_KEJADIAN} ${whereSql} ORDER BY d.\`date\` DESC, d.id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );
    res.json({
      data: rows.map(keRecord),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  })
);

// Ekspor CSV semua hasil filter (maks. 50.000 baris)
app.get(
  '/api/disasters/export',
  wrap(async (req, res) => {
    const { whereSql, params } = bangunFilterKejadian(req.query, { denganId: req.query.cariId === '1' });
    const [rows] = await pool.query(
      `SELECT d.*, DATE_FORMAT(d.\`date\`, '%Y-%m-%d') AS date_str FROM data_bencana d ${whereSql} ORDER BY d.\`date\` DESC, d.id DESC LIMIT 50000`,
      params
    );
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const header = ['ID', 'Tanggal', 'Jenis', 'Kabupaten/Kota', 'Provinsi', 'Meninggal', 'Hilang', 'Luka', 'Rumah Rusak', 'Rumah Terendam', 'Fasilitas Rusak', 'Penyebab'];
    const baris = rows.map((r) =>
      [
        r.id, r.date_str, esc(titleCase(r.disaster_type)), esc(titleCase(r.city)), esc(titleCase(normalisasiProvinsi(r.province))),
        Math.round(r.death || 0), Math.round(r.missing_person || 0), Math.round(r.injured_person || 0),
        Math.round(r.damaged_house || 0), Math.round(r.flooded_house || 0), r.damaged_facility || 0, esc(r.cause),
      ].join(',')
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pantaubencana_data_kejadian.csv"');
    res.send('\uFEFF' + [header.join(','), ...baris].join('\r\n'));
  })
);

// Daftar nama kabupaten/kota yang sudah ada di database (untuk saran pengisian form)
app.get(
  '/api/disasters/cities',
  wrap(async (req, res) => {
    const provinsi = String(req.query.provinsi || '').trim().toUpperCase();
    if (!provinsi) return res.json([]);
    const [rows] = await pool.query('SELECT DISTINCT city FROM data_bencana WHERE province IN (?) ORDER BY city', [varianProvinsi(provinsi)]);
    res.json(rows.map((r) => titleCase(r.city)));
  })
);

// GET /api/stats -> jumlah kejadian per jenis
app.get(
  '/api/stats',
  wrap(async (_req, res) => {
    const [rows] = await pool.query(
      'SELECT disaster_type AS jenis, COUNT(*) AS total FROM data_bencana GROUP BY disaster_type ORDER BY total DESC'
    );
    res.json(rows.map((r) => ({ jenis: titleCase(r.jenis), total: r.total })));
  })
);

// GET /api/summary -> angka ringkasan nasional untuk kartu statistik
app.get(
  '/api/summary',
  wrap(async (_req, res) => {
    const [[r]] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(death), 0) AS meninggal,
              COALESCE(SUM(missing_person), 0) AS hilang,
              COALESCE(SUM(injured_person), 0) AS luka,
              COALESCE(SUM(damaged_house), 0) AS rumahRusak,
              COALESCE(SUM(flooded_house), 0) AS rumahTerendam,
              COALESCE(SUM(damaged_facility), 0) AS fasilitasRusak
       FROM data_bencana`
    );
    res.json({
      total: Number(r.total),
      meninggal: Math.round(r.meninggal),
      hilang: Math.round(r.hilang),
      luka: Math.round(r.luka),
      rumahRusak: Math.round(r.rumahRusak),
      rumahTerendam: Math.round(r.rumahTerendam),
      fasilitasRusak: Math.round(r.fasilitasRusak),
    });
  })
);

// ---------- Endpoint admin: kejadian ----------
app.post(
  '/api/disasters',
  wajibAdmin,
  wrap(async (req, res) => {
    const v = await bacaBodyKejadian(req.body);
    const cityId = await cariCityId(v.city, v.provinsi);
    const [result] = await pool.query(
      `INSERT INTO data_bencana
        (city_id, \`date\`, disaster_type, city, province, cause, death, missing_person, injured_person, damaged_house, flooded_house, damaged_facility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cityId, v.tanggal, v.jenis, v.city, v.provinsi, v.cause, v.death, v.missing, v.injured, v.damagedHouse, v.floodedHouse, v.damagedFacility]
    );
    res.status(201).json(await ambilKejadianById(result.insertId));
  })
);

app.put(
  '/api/disasters/:id',
  wajibAdmin,
  wrap(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) throw new HttpError(400, 'ID kejadian tidak valid.');
    const v = await bacaBodyKejadian(req.body);
    const cityId = await cariCityId(v.city, v.provinsi);
    const [result] = await pool.query(
      `UPDATE data_bencana SET city_id = ?, \`date\` = ?, disaster_type = ?, city = ?, province = ?, cause = ?,
         death = ?, missing_person = ?, injured_person = ?, damaged_house = ?, flooded_house = ?, damaged_facility = ?
       WHERE id = ?`,
      [cityId, v.tanggal, v.jenis, v.city, v.provinsi, v.cause, v.death, v.missing, v.injured, v.damagedHouse, v.floodedHouse, v.damagedFacility, id]
    );
    if (!result.affectedRows) throw new HttpError(404, 'Data kejadian tidak ditemukan.');
    res.json(await ambilKejadianById(id));
  })
);

app.delete(
  '/api/disasters/:id',
  wajibAdmin,
  wrap(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) throw new HttpError(400, 'ID kejadian tidak valid.');
    const [result] = await pool.query('DELETE FROM data_bencana WHERE id = ?', [id]);
    if (!result.affectedRows) throw new HttpError(404, 'Data kejadian tidak ditemukan.');
    res.json({ ok: true });
  })
);

// ---------- Endpoint admin: pengguna ----------
// GET /api/users?page=1&pageSize=10&role=admin|user&q=kata
app.get(
  '/api/users',
  wajibAdmin,
  wrap(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(1000, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const where = [];
    const params = [];

    const role = String(req.query.role || '').toLowerCase();
    if (role === 'admin' || role === 'user') {
      where.push('role = ?');
      params.push(role);
    }
    const q = String(req.query.q || '').trim();
    if (q) {
      const like = `%${q}%`;
      where.push('(name LIKE ? OR email LIKE ? OR id = ?)');
      params.push(like, like, /^\d+$/.test(q) ? Number(q) : -1);
    }
    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);
    const [rows] = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ${whereSql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );
    const [[hitung]] = await pool.query(
      `SELECT COUNT(*) AS semua, COALESCE(SUM(role = 'admin'), 0) AS admin, COALESCE(SUM(role = 'user'), 0) AS user FROM users`
    );

    res.json({
      data: rows.map(keUser),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      counts: { semua: Number(hitung.semua), admin: Number(hitung.admin), user: Number(hitung.user) },
    });
  })
);

app.post(
  '/api/users',
  wajibAdmin,
  wrap(async (req, res) => {
    const peran = String(req.body?.peran || 'User').toLowerCase();
    if (peran !== 'admin' && peran !== 'user') throw new HttpError(400, 'Peran tidak valid.');
    const user = await buatUser({ ...req.body, role: peran });
    res.status(201).json(keUser(user));
  })
);

// ---------- Error handler ----------
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan.')));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Format data tidak valid.' });
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

const PORT = Number(process.env.API_PORT || 5000);
app.listen(PORT, () => console.log(`API PantauBencana jalan di http://localhost:${PORT} (database: ${DB_NAME})`));
