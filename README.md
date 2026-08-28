# HOP & HAM

Toko online hamster, kelinci, dan perlengkapan berbasis Next.js, Vercel, dan Supabase.

## Fitur

- Katalog dan stok berasal dari Supabase serta langsung dipakai storefront dan admin
- Keranjang dengan kuantitas, checkout, validasi harga/stok server-side, dan pengurangan stok atomik
- QRIS dinamis dari QR merchant HOP & HAM; nominal total otomatis muncul saat dipindai
- Ongkir: Rp10.000 + Rp49/km, dibulatkan ke Rp500 terdekat
- Supabase Auth untuk email/password dan Google OAuth
- Akun pelanggan, profil, alamat, riwayat order, serta status pembayaran
- Dashboard admin terproteksi role untuk katalog, stok, pesanan, dan verifikasi pembayaran
- Row Level Security, token pembayaran tamu, dan webhook bertanda tangan

## Menjalankan lokal

```bash
npm install
copy .env.example .env.local
npm run dev
```

Untuk mengaktifkan database, jalankan migrasi [Supabase](supabase/migrations/202608260001_initial_store.sql), isi `.env.local`, lalu:

```bash
npm run db:seed
```

## Pemeriksaan

```bash
npm test
npm run lint
npm run build
```

Petunjuk lengkap ada di [DEPLOYMENT.md](DEPLOYMENT.md).
