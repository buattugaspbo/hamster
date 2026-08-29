# Deploy HOP & HAM ke Vercel + Supabase

## 1. Buat database Supabase

1. Buat project di Supabase.
2. Buka **SQL Editor** dan jalankan seluruh isi `supabase/migrations/202608260001_initial_store.sql`.
3. Salin Project URL, Publishable Key, dan Secret/Service Role Key dari menu API.
4. Buat `.env.local` dari `.env.example`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Jangan pernah memakai `SUPABASE_SERVICE_ROLE_KEY` pada variabel berawalan `NEXT_PUBLIC_`.

Isi katalog awal:

```bash
npm run db:seed
```

## 2. Siapkan autentikasi

Di Supabase Authentication:

- set Site URL ke domain Vercel produksi;
- tambahkan `https://DOMAIN-VERCEL/auth/callback` ke Redirect URLs;
- aktifkan Email provider;
- aktifkan Google provider bila tombol Google akan digunakan.

Buat akun pemilik melalui halaman `/register`, cari UUID-nya di Authentication > Users, kemudian promosikan melalui SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID_AKUN_PEMILIK';
```

Dashboard tersedia di `/admin`. Pengguna biasa akan ditolak oleh server dan RLS.

## 3. QRIS

QR merchant yang diberikan sudah didekode, diverifikasi CRC, dan disimpan sebagai sumber bawaan. Crop presisi tersedia di `public/qris-static.png`.

Saat order dibuat, server:

1. mengambil total yang dihitung dari harga database dan ongkir;
2. mengubah Point of Initiation Method menjadi dinamis;
3. memasukkan nominal ke field QRIS Transaction Amount;
4. menghitung ulang CRC;
5. menghasilkan gambar QR baru khusus order tersebut.

Tombol “Saya sudah membayar” hanya mengubah status menjadi **Menunggu verifikasi**. Admin dapat mengubahnya menjadi **Dibayar** dari dashboard. Endpoint `POST /api/payments/webhook` juga tersedia untuk acquirer/payment gateway, menggunakan HMAC SHA-256 pada body mentah dan header `x-hop-signature`.

QRIS statis tidak menyediakan notifikasi settlement otomatis. Untuk verifikasi sepenuhnya otomatis, adapter webhook harus disesuaikan dengan API acquirer yang menerbitkan QR tersebut.

## 4. Deploy Vercel

Import repository sebagai project Next.js di Vercel. Tambahkan variabel berikut untuk Production dan Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `PAYMENT_WEBHOOK_SECRET` bila webhook dipakai
- variabel API wilayah bila memakai vendor eksternal

Build command: `npm run build`. Output directory tidak perlu diisi karena Vercel mengenali Next.js secara otomatis.

Repo juga menyertakan `vercel.json` yang memaksa preset Next.js dan mengosongkan override output directory. Integrasi Supabase Marketplace didukung melalui nama variabel publishable/anon/secret bawaannya.

Setelah domain produksi tersedia, perbarui `NEXT_PUBLIC_SITE_URL` dan konfigurasi redirect Supabase, lalu redeploy.

## 5. Checklist produksi

- Ganti nomor WhatsApp demo di source code dengan nomor toko.
- Verifikasi koordinat toko pada `lib/shipping.ts`.
- Uji scan QRIS nominal kecil dari dua aplikasi pembayaran berbeda.
- Aktifkan CAPTCHA/rate limiting bila checkout publik mulai menerima spam.
- Hubungkan webhook acquirer bila verifikasi otomatis diperlukan.
- Audit lisensi media eksternal atau pindahkan aset ke CDN sendiri.
