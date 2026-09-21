// Backend PantauBencana: Express + MySQL (database data_bencana)
// Jalankan: npm run server
import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
app.use(express.json());

// Koneksi ke MySQL (yang dikelola lewat phpMyAdmin). Default sesuai XAMPP/Laragon.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'data_bencana',
  waitForConnections: true,
  connectionLimit: 10,
});

// ---------- Helper konversi baris DB -> bentuk DisasterRecord di frontend ----------
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
  const x = p.trim().toUpperCase();
  if (x === 'P A P U A') return 'PAPUA';
  if (x === 'DAERAH ISTIMEWA YOGYAKARTA') return 'DI YOGYAKARTA';
  return x;
};

// Tabel data_bencana TIDAK punya kolom latitude/longitude.
// Sementara dipakai titik tengah provinsi (perkiraan) + geser kecil berdasarkan city_id
// supaya marker antar-kota tidak menumpuk. Solusi akurat: tambah kolom lat/lng di DB.
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

const koordinat = (provinsi, cityId) => {
  const [lat, lng] = PUSAT_PROVINSI[provinsi] || PUSAT_INDONESIA;
  const a = ((cityId * 9301 + 49297) % 233280) / 233280; // pseudo-acak deterministik 0..1
  const b = ((cityId * 7919 + 12345) % 233280) / 233280;
  return [Number((lat + (a - 0.5) * 0.8).toFixed(4)), Number((lng + (b - 0.5) * 0.8).toFixed(4))];
};

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

const keRecord = (r) => {
  const d = new Date(r.date_str + 'T00:00:00');
  const meninggal = Math.round(r.death || 0);
  const hilang = Math.round(r.missing_person || 0);
  const luka = Math.round(r.injured_person || 0);
  const rusak = Math.round(r.damaged_house || 0);
  const terendam = Math.round(r.flooded_house || 0);
  const provinsi = normalisasiProvinsi(r.province);
  const [latitude, longitude] = koordinat(provinsi, r.city_id);

  const dampak = [
    meninggal && `${fmt(meninggal)} meninggal`,
    hilang && `${fmt(hilang)} hilang`,
    luka && `${fmt(luka)} luka`,
    rusak && `${fmt(rusak)} rumah rusak`,
    terendam && `${fmt(terendam)} rumah terendam`,
    r.damaged_facility && `${fmt(r.damaged_facility)} fasilitas rusak`,
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
    tingkatRisiko,
    deskripsiDetail: r.cause,
  };
};

// ---------- Endpoint ----------
app.get('/api/health', async (_req, res) => {
  try {
    const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM data_bencana');
    res.json({ ok: true, database: process.env.DB_NAME || 'data_bencana', total: row.total });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/disasters?limit=1000&jenis=BANJIR&provinsi=BALI&q=kata
app.get('/api/disasters', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 1000, 5000);
    const where = [];
    const params = [];
    if (req.query.jenis) { where.push('disaster_type = ?'); params.push(String(req.query.jenis).toUpperCase()); }
    if (req.query.provinsi) { where.push('province = ?'); params.push(String(req.query.provinsi).toUpperCase()); }
    if (req.query.q) {
      where.push('(city LIKE ? OR province LIKE ? OR disaster_type LIKE ?)');
      const like = `%${req.query.q}%`;
      params.push(like, like, like);
    }
    const sql = `SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date_str FROM data_bencana
                 ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                 ORDER BY date DESC, id DESC LIMIT ?`;
    const [rows] = await pool.query(sql, [...params, limit]);
    res.json(rows.map(keRecord));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats -> jumlah kejadian per jenis (untuk kartu statistik dashboard)
app.get('/api/stats', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT disaster_type AS jenis, COUNT(*) AS total FROM data_bencana GROUP BY disaster_type ORDER BY total DESC'
    );
    res.json(rows.map((r) => ({ jenis: titleCase(r.jenis), total: r.total })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = Number(process.env.API_PORT || 5000);
app.listen(PORT, () => console.log(`API PantauBencana jalan di http://localhost:${PORT}`));
