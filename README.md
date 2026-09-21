Panduan Menjalankan Website
Berikut adalah langkah-langkah untuk menginstal dan menjalankan website secara lokal:

1. Instalasi Dependensi
Ekstrak file zip project. Buka terminal di dalam folder project tersebut dan jalankan perintah berikut:

npm install --legacy-peer-deps

(Catatan: Pastikan menggunakan --legacy-peer-deps karena perintah npm install biasa akan gagal akibat konflik versi peer dependency dari bawaan project).

3. Konfigurasi Database

Buka phpMyAdmin melalui XAMPP atau aplikasi sejenis.

Buat database baru dengan nama pantaubencana.

Lakukan Import file pantaubencana.sql ke dalam database tersebut.
(Nama database ini sudah dikonfigurasi di dalam file .env menggantikan nama sebelumnya).

3. Menjalankan Server dan Frontend
Buka dua terminal yang mengarah ke folder project ini, lalu jalankan perintah berikut di masing-masing terminal:
Terminal 1 (Menjalankan API Server):

Bash
npm run server
Terminal 2 (Menjalankan Web/Frontend):

Bash
npm run dev

4. Akses Login Admin
Setelah website berhasil berjalan di browser, Anda dapat masuk menggunakan kredensial admin berikut:

Email: admin@gmail.com

Password: admin123
