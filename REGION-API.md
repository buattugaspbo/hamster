# Integrasi API Wilayah Indonesia

Checkout sudah memanggil endpoint internal, bukan vendor secara langsung:

- `GET /api/regions?level=province`
- `GET /api/regions?level=regency&parent=16`
- `GET /api/regions?level=district&parent=1671`
- `POST /api/shipping/quote` dengan JSON `{ "regencyCode": "1671", "districtCode": "167101" }`

Tanpa konfigurasi apa pun, endpoint wilayah memakai dataset fallback di `lib/regions.ts`. Untuk vendor API pilihan Anda, isi:

```env
INDONESIA_REGION_API_URL=https://api.vendor.example/wilayah
INDONESIA_REGION_API_TOKEN=secret
```

Adapter mengharapkan respons berupa array atau `{ "data": [...] }`. Setiap item minimal memiliki `code`/`id` dan `name`/`nama`. Bila kontrak vendor berbeda, cukup ubah `normalizeExternalRegions()` di `app/api/regions/route.ts`; komponen checkout tidak perlu diubah.

Koordinat kabupaten/kota fallback dipakai untuk estimator ongkir. Rumus saat ini:

```text
jarak = Haversine(titik toko Palembang, titik kabupaten/kota pembeli)
tarif = Rp10.000 + (jarak × Rp49/km)
hasil = pembulatan terdekat Rp500
```

Dengan rumus tersebut, 500 km menghasilkan Rp34.500 setelah pembulatan. Estimasi Haversine adalah jarak garis lurus. Untuk tarif berbasis jalan, ganti fungsi quote dengan respons distance matrix/routing API, lalu teruskan jarak kilometernya ke `calculateShippingCost()`.
