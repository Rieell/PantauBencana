# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/66dd5f2f-6413-4ed1-82be-1ab3f9101a97

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Menjalankan dengan database (phpMyAdmin / XAMPP)

1. Nyalakan **MySQL** di XAMPP. Di phpMyAdmin buat database `pantaubencana`, lalu **Import** file `pantaubencana.sql`.
2. Cek `.env`: `DB_NAME=pantaubencana`, `DB_USER=root`, `DB_PASSWORD=` (kosong untuk XAMPP), dan `JWT_SECRET` terisi.
3. `npm install --legacy-peer-deps`
4. Terminal 1: `npm run server` (API di http://localhost:5000)
5. Terminal 2: `npm run dev` (web di http://localhost:3000)

Login admin: `admin@gmail.com` / `admin123` (dari tabel `users`).
