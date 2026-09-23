# 🚀 Panduan Menjalankan Website

Berikut adalah langkah-langkah untuk menginstal dan menjalankan website ini.

---

## 📦 1. Instalasi Dependensi

Ekstrak file zip project. Buka terminal di dalam direktori project tersebut, lalu jalankan perintah berikut:

```bash
npm install --legacy-peer-deps

```

> **⚠️ Catatan Penting:**
> Pastikan Anda menambahkan flag `--legacy-peer-deps`. Jika menggunakan `npm install` biasa, proses instalasi akan gagal akibat konflik versi *peer dependency* bawaan dari project.

---

## 🗄️ 2. Konfigurasi Database

1. Buka **phpMyAdmin** melalui XAMPP atau aplikasi server lokal sejenis.
2. Buat database baru dan beri nama `pantaubencana`.
3. Lakukan **Import** file `pantaubencana.sql` ke dalam database yang baru dibuat.

> 💡 **Info:** Nama database ini sudah otomatis dikonfigurasi di dalam file `.env` menggantikan nama sebelumnya.
> 📊 **Sumber Data:** Dataset bencana alam yang digunakan dalam database ini diambil dari Kaggle: [Indonesia Natural Disaster Dataset (BNPB Records)](https://www.kaggle.com/datasets/maudiana/indonesia-natural-disaster-dataset-bnpb-records?utm_source=gemini).

---

## ⚙️ 3. Menjalankan Server dan Frontend

Buka **dua terminal** terpisah yang mengarah ke folder project ini. Jalankan perintah berikut di masing-masing terminal:

**Terminal 1 (Menjalankan API Server):**

```bash
npm run server

```

**Terminal 2 (Menjalankan Web/Frontend):**

```bash
npm run dev

```

---

## 🔐 4. Akses Login Admin

Setelah server dan frontend berhasil berjalan, buka browser dan akses localhost Anda. Gunakan kredensial berikut untuk masuk sebagai Admin:

* **Email:** `admin@gmail.com`
* **Password:** `admin123`

---

```

```
