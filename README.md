# PantauBencana

Portal informasi bencana alam Indonesia: peta interaktif, katalog data kejadian, dan dashboard admin.

**Teknologi:** React 19 + Vite + Tailwind (frontend), Express (backend API), MySQL (database).

**Sumber data:** [Indonesia Natural Disaster Dataset (BNPB Records)](https://www.kaggle.com/datasets/maudiana/indonesia-natural-disaster-dataset-bnpb-records) dari Kaggle.

---

## Struktur folder

```
PantauBencana/
├── api/index.js        Pintu masuk serverless function di Vercel
├── server/
│   ├── app.js          Aplikasi Express (semua endpoint /api/*)
│   └── index.js        Menjalankan API secara lokal
├── src/                Frontend React
├── database/           Taruh pantaubencana.sql di sini
├── scripts/            Utilitas (buat hash password)
├── vercel.json         Konfigurasi deploy Vercel
├── .env.example        Contoh pengaturan environment
└── package.json
```

---

## Menjalankan di komputer sendiri

**1. Instal dependensi**

```bash
npm install --legacy-peer-deps
```

**2. Siapkan database**

1. Nyalakan MySQL di XAMPP, buka phpMyAdmin.
2. Buat database `pantaubencana`.
3. Import file `pantaubencana.sql`.

**3. Buat file `.env`**

```bash
cp .env.example .env
```

Untuk XAMPP, nilai bawaan di `.env.example` sudah cocok. Isi `JWT_SECRET` dengan string acak supaya sesi login tidak hilang saat server restart.

**4. Jalankan (dua terminal)**

```bash
npm run server   # Terminal 1: API di http://localhost:5000
npm run dev      # Terminal 2: web di http://localhost:3000
```

Cek koneksi database: buka `http://localhost:5000/api/health`.

---

## Deploy ke Vercel + MySQL cloud

1. **Database cloud.** Buat service MySQL (mis. Aiven), lalu import `database/pantaubencana.sql` ke sana (lihat `database/README.md`).
2. **Push ke GitHub.** Pastikan `.env` tidak ikut ter-upload (sudah diatur di `.gitignore`).
3. **Import proyek di Vercel** (Add New → Project). Pengaturan build sudah ada di `vercel.json`.
4. **Isi Environment Variables** di Vercel:

   | Nama | Isi |
   |---|---|
   | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Dari halaman service database |
   | `DB_SSL` | `true` |
   | `DB_CA` | Sertifikat CA dalam satu baris, baris baru diganti `\n` |
   | `JWT_SECRET` | String acak panjang (wajib) |

5. **Deploy**, lalu buka `https://NAMA-PROYEK.vercel.app/api/health`. Hasil `{"ok":true,...}` berarti API dan database sudah tersambung.

Setelah mengubah Environment Variables, lakukan **Redeploy** agar nilainya terbaca.

---

## Akun admin

Akun disimpan di tabel `users`. **Ganti password admin bawaan sebelum situs dipublikasikan.**

```bash
npm run hash-password -- "PasswordBaruYangKuat"
```

Salin perintah `UPDATE` yang tampil, lalu jalankan di phpMyAdmin (lokal) atau DBeaver (database cloud).

---

## Catatan

- Ekspor CSV dibatasi 15.000 baris di Vercel karena batas ukuran respons fungsi serverless (50.000 baris di lokal). Ubah dengan `EXPORT_MAX_ROWS`.
- Paket gratis database cloud umumnya bukan untuk produksi dan bisa dimatikan jika lama tidak dipakai. Cek statusnya sebelum demo.
